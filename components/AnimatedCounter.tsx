'use client'

import CountUp from "react-countup";

interface AnimatedCounterProps{
    amount: number;
}

const AnimatedCounter = ({amount}:AnimatedCounterProps) => {
  return (
      <div className="w-full">
          <CountUp
              duration={2.75}
              decimal="."
              prefix="Ksh"
              decimals={2}
              end={amount}
          />
      </div>
  )
}

export default AnimatedCounter