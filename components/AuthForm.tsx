'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import CustomInput from './CustomInput'
import { authFormSchema } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { signIn, signUp } from '@/lib/actions/user.actions'


const AuthForm = ({ type }: AuthFormProps) => {
    const formShema = authFormSchema(type);
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
  // 1. Define your form.
  const form = useForm<z.infer<typeof formShema>>({
    resolver: zodResolver(formShema),
    defaultValues: {
        email: "",
        password: ""
    },
  })
 
  // 2. Define a submit handler.
  const onSubmit = async(values: z.infer<typeof formShema>) => {
    // Do something with the form values.
      // ✅ This will be type-safe and validated.
      setIsLoading(true);
      try {
        if (type === 'sign-in') {
            const res = await signIn({
                email: values.email,
                password: values.password
            }); 
            if (res) router.push("/");
        }
        if (type === 'sign-up') {
            const newUser = await signUp(values);
            setUser(newUser);
        }
        
      } catch (error) {
        
      } finally {
          
        setIsLoading(false);
      }
      console.log(values)
  }    

  return (
      <section className='auth-form'>
          <header className='flex flex-col gap-5 md:gap-8'>
            <Link href="/"
                className='cursor-pointer flex items-center gap-1'
                >
                <Image
                    src="/icons/logo.svg"
                    height={34}
                    width={34}
                    alt='Reservex logo'
                />
                  <h1 className='text-26 font-ibm-plex-serif font-bold text-black-1'>
                      ReserveX
                  </h1>
              </Link> 
              <div className='flex flex-col gap-1 md:gap-3'>
                  <h1 className='text-24 lg:text-36 font-semibold text-gray-900'>
                      {user ? "Link Account" :
                          type === "sign-in" ? "Sign In" :
                              "Sign Up"}
                      <p className='text-16 font-normal text-gray-600'>
                          {user ? 
                              "Link your account to get started" :
                              "Please enter your details"
                        }
                      </p>
                  </h1>
              </div>  
          </header>
          {user ? (
              <div className='flex flex-col gap-4'>
                  {/* plaidlink */}
              </div>
          ) : (
                  <>
        <Form {...form}>
                          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                              {type === 'sign-up' && (
                                  <>
                                      <div className='flex gap-4'>                                         
                                        <CustomInput
                                            name="firstName"
                                            label='First Name'
                                            placeholder='Enter your first name'
                                            type="text"
                                            control={form.control}
                                        />
                                        <CustomInput
                                            name="lastName"
                                            label='Last Name'
                                            placeholder='Enter your last name'
                                            type="text"
                                            control={form.control}
                                        />
                                      </div>
                                  <CustomInput
                                      name="address1"
                                      label='Address'
                                      placeholder='Enter your specific address'
                                      type="text"
                                      control={form.control}
                                      />
                                  <CustomInput
                                      name="city"
                                      label='City'
                                      placeholder='Enter your city'
                                      type="text"
                                      control={form.control}
                                      />
                                      <div className='flex gap-4'>                                         
                                        <CustomInput
                                            name="state"
                                            label='State'
                                            placeholder='Example: NY'
                                            type="text"
                                            control={form.control}
                                        />
                                        <CustomInput
                                            name="postalCode"
                                            label='Postal Code'
                                            placeholder='Example: 55555'
                                            type="text"
                                            control={form.control}
                                        />
                                      </div>
                                      <div className='flex gap-4'>                                
                                        <CustomInput
                                            name="dateOfBirth"
                                            label='Date of Birth'
                                            placeholder='YYYY-MM-DD'
                                            type="text"
                                            control={form.control}
                                            />
                                        <CustomInput
                                            name="nationalId"
                                            label='National ID'
                                            placeholder='Example: 123456'
                                            type="text"
                                            control={form.control}
                                        />                                      
                                      </div>
                                  </>
                              )}
            <CustomInput
                name="email"   
                label='Email'
                control={form.control}  
                type="text"  
                placeholder='Enter your email'  
                              
            />
            <CustomInput
                name="password"   
                label='Password'
                control={form.control}  
                type="password"  
                placeholder='Enter your password'              
                              />
                              <div className='flex flex-col gap-4'>
            <Button type="submit" className='form-btn'>
                              {isLoading ? (
                                  <>
                                      <Loader2
                                          size={20}
                                          className='animate-spin'
                                      />&nbsp;
                                      Loading...
                                  </>
                              ) : type === 'sign-in' ?
                                  'Sign In' :
                                  'Sign Up'}
            </Button>
                             </div>                  
        </form>
                  </Form>
                <footer className='flex justify-center gap-1'>
                          <p className="text-14 font-normal text-gray-600">
                              {type === 'sign-in' ?
                                  "Don't have an account?" :
                                  "Already have an account?"}
                          </p>
                          <Link className='form-link' href={type === 'sign-in' ? '/sign-up' : 'sign-in'}>
                              {type === 'sign-in'? 'Sign-up' : 'Sign-in'}
                          </Link>
                  </footer>
                  </>
          )}
      </section>
  )
}

export default AuthForm