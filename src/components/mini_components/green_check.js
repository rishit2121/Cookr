const CheckMark = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="1.3em"
        height="1.3em"
        style={{ marginTop:'3%', marginRight:'4%'}}
      >
        <g fill="none">
          <path
            fill="url(#fluentColorCheckmarkCircle240)"
            d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2"
          ></path>
          <path
            fill="url(#fluentColorCheckmarkCircle241)"
            d="m15.22 8.97l-4.47 4.47l-1.97-1.97a.75.75 0 0 0-1.06 1.06l2.5 2.5a.75.75 0 0 0 1.06 0l5-5a.75.75 0 1 0-1.06-1.06"
          ></path>
          <defs>
            <linearGradient
              id="fluentColorCheckmarkCircle240"
              x1="2.714"
              x2="16.517"
              y1="5.75"
              y2="20.09"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#52D17C"></stop>
              <stop offset="1" stopColor="#22918B"></stop>
            </linearGradient>
            <linearGradient
              id="fluentColorCheckmarkCircle241"
              x1="9.188"
              x2="10.681"
              y1="9.413"
              y2="16.713"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#fff"></stop>
              <stop offset="1" stopColor="#E3FFD9"></stop>
            </linearGradient>
          </defs>
        </g>
      </svg>
    )
  }
export default CheckMark;
  