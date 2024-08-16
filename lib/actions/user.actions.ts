'use server'

import { ID, Query } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { cookies } from "next/headers";
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { plaidClient } from "@/lib/plaid";
import { revalidatePath } from "next/cache";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
  APPWRITE_DATABASE_ID: DATABASE_ID,
  APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
  APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID
 } = process.env;

export const getUserInfo = async({userId}: getUserInfoProps) => {
  try {
    const { database } = await createAdminClient();
    const user = await database.listDocuments(
      DATABASE_ID!,
      USER_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );
    return parseStringify(user.documents[0]);
  } catch (error) {
    console.log(error);
    
  }   
 }
export const signIn = async ({ email, password}: signInProps) => {
  try {
  const { account } = await createAdminClient();
  const session = await account.createEmailPasswordSession(email, password);
  cookies().set("appwrite-session", session.secret, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  }); 
    const user = await getUserInfo({ userId: session.userId });
    return parseStringify(user);       
        
    } catch (error) {
    return null; 
    }
}
export const signUp = async ({ password, ...data }: SignUpParams) => {
  
  const { email, firstName, lastName } = data;
  let newUserAccount;
    try {
  const { account, database } = await createAdminClient();

      newUserAccount = await account.create(
        ID.unique(),
        email,
        password,
        `${firstName} ${lastName}`);
        if (!newUserAccount) throw new Error('Error creating user');
        
        const dwollaCustomerUrl = await createDwollaCustomer({
          ...data,
          type: 'personal'
        })
        
      if (!dwollaCustomerUrl) throw new Error('Error creating Dwolla customer');
        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);
        const newUser = await database.createDocument(
          DATABASE_ID!,
          USER_COLLECTION_ID!,
          ID.unique(),
          {
            ...data,
            userId: newUserAccount.$id,
            dwollaCustomerId,
            dwollaCustomerUrl
          }
        )
  const session = await account.createEmailPasswordSession(email, password);

  cookies().set("appwrite-session", session.secret, {
    path: "/",
    httpOnly: true,
    sameSite: "strict",
    secure: true,
  });       
      
    return parseStringify(newUser);
    } catch (error) {
      console.log(error);
      
      return null;
    }
}

export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();
    const res = await account.get(); 
    const user = await getUserInfo({ userId: res.$id });
    
    return parseStringify(user);
  } catch (error) {
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();
    cookies().delete('appwrite-session');
    await account.deleteSession('current');
  } catch (error) {
    return null;
  }
}

export const createLinkToken = async (user: User) => {
  try {
    const tokenParams = {
      user: {
        client_user_id: user.$id
      },
      client_name: `${user.firstName} ${user.lastName}`,
      products: ['auth'] as Products[],
      language: 'en',
      country_codes: ['US'] as CountryCode[]
    };
    const res = await plaidClient.linkTokenCreate(tokenParams);
    
    return parseStringify({ linkToken: res.data.link_token })
  } catch (error) {
    console.log(error);
  }
};

export const createBankAccount = async ({
  userId,
  bankId,
  accountId,
  accessToken,
  fundingSourceUrl,
  shareableId
}: createBankAccountProps) => {
  try {
    const { database } = await createAdminClient();
    const bankAccount = await database.createDocument(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      ID.unique(),
      {
        userId,
        bankId,
        accountId,
        accessToken,
        fundingSourceUrl,
        shareableId
      }
    );
    
    return parseStringify(bankAccount);
  } catch (error) {
    console.log(error );
    
  }
}
export const exchangePublicToken = async ({ publicToken, user}: exchangePublicTokenProps) => {
  try {
    // Get access token and item ID using public token
    const res = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });
    const accessToken = res.data.access_token;
    const itemId = res.data.item_id;
    // Now get account info using access token
    const accountResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });
    const accountData = accountResponse.data.accounts[0];

    // Now create a processor token for Dwolla using the access token and account ID
    const request: ProcessorTokenCreateRequest = {
      access_token: accessToken,
      account_id: accountData.account_id,
      processor: 'dwolla' as ProcessorTokenCreateRequestProcessorEnum
    };
    const processorTokenRes = await plaidClient.processorTokenCreate(request);
    const processorToken = processorTokenRes.data.processor_token;

    // Create a funding source URL for the account using Dwolla CustomerID, processor token and
    // bank name
    const fundingSourceUrl = await addFundingSource({
      dwollaCustomerId: user.dwollaCustomerId,
      processorToken,
      bankName: accountData.name,
    });

    if (!fundingSourceUrl) throw Error;

    // Create a bank account using the user ID, item ID, account ID, access token,
    // funding source URL and sharable ID
    await createBankAccount({
      userId: user.$id,
      bankId: itemId,
      accountId: accountData.account_id,
      accessToken,
      fundingSourceUrl,
      shareableId: encryptId(accountData.account_id)
    });
    // Revalidata path to reflect changes
    revalidatePath("/");
    // return success message
    return parseStringify({ publicTokenExchange: "complete" });
  } catch (error) {
    console.log(error)
  }
}

export const getBanks = async ({ userId }: getBanksProps) => {
  
  try {
    const { database } = await createAdminClient();
    const banks = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('userId', [userId])]
    );
    return parseStringify(banks.documents);
  } catch (error) {
    console.log(error);
    
  }
}

export const getBank = async ({ documentId }: getBankProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('$id', [documentId])]
    )

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log(error)
  }
}

export const getBankByAccountId = async ({ accountId }: getBankByAccountIdProps) => {
  try {
    const { database } = await createAdminClient();

    const bank = await database.listDocuments(
      DATABASE_ID!,
      BANK_COLLECTION_ID!,
      [Query.equal('accountId', [accountId])]
    )

    if(bank.total !== 1) return null;

    return parseStringify(bank.documents[0]);
  } catch (error) {
    console.log(error)
  }
}