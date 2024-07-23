import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getLoggedInUser } from '@/lib/actions/user.actions';

const Home = async() => {
  const loggedIn = await getLoggedInUser();
  
  return (
    <section className='home'>
      <div className='home-content'>
        <header className='home-header'>
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.name || "Guest"}
            subtext="Access and manage your accounts efficiently."
          />
          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={1200.50}
          />
        </header>
        {/* Recent transactions */}
      </div>
      <RightSidebar
        user={loggedIn}
        transactions={[]}
        banks={[
          { currentBalance: 200.5, mask: 1234},
          { currentBalance:  500.5, mask: 4321}]}
      />
    </section>
  )
}

export default Home