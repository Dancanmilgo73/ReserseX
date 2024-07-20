import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import React from 'react'

const Home = () => {
  const loggedIn = {
    firstName: "Tich",
    lastName: "Milgo",
    email: 'milgo@hello.com'
  };
  return (
    <section className='home'>
      <div className='home-content'>
        <header className='home-header'>
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn.firstName || "Guest"}
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
          { currentBalance: 100.50, mask: 5438 },
          { currentBalance: 200.25, mask: 5362 }]}
      />
    </section>
  )
}

export default Home