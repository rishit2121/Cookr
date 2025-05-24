function Comments({ comment, formatBoldText, randomColor, setShowComments}) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "0",
        width: '100%',
        maxHeight: "420px",
        overflowY: "auto",
        transition: "max-height 0.5s ease-in-out",
        zIndex: "1",
        background: "#fff",
        padding: "18px",
        boxSizing: "border-box",
        borderTopLeftRadius: "16px",
        borderTopRightRadius: "16px",
        backgroundColor: "#383838",
      }}
    >
      <div style={{ display: "flex", justifyContent: "end", height:"0px"}}>
        <svg
          onClick={async()=>setShowComments(false)}
          style={{ cursor: "pointer" }}
          width="22px"
          height="22px"
          viewBox="0 0 24 24"
          fill="white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M5.29289 5.29289C5.68342 4.90237 6.31658 4.90237 6.70711 5.29289L12 10.5858L17.2929 5.29289C17.6834 4.90237 18.3166 4.90237 18.7071 5.29289C19.0976 5.68342 19.0976 6.31658 18.7071 6.70711L13.4142 12L18.7071 17.2929C19.0976 17.6834 19.0976 18.3166 18.7071 18.7071C18.3166 19.0976 17.6834 19.0976 17.2929 18.7071L12 13.4142L6.70711 18.7071C6.31658 19.0976 5.68342 19.0976 5.29289 18.7071C4.90237 18.31658 4.90237 17.6834 5.29289 17.2929L10.5858 12L5.29289 6.70711C4.90237 6.31658 4.90237 5.68342 5.29289 5.29289Z"
            fill="white"
          />
        </svg>
      </div>
      {comment?.map((comment, index) => (
        <div key={index} style={{ display: "flex", padding: "16px 0px" }}>
          <div
            alt="Profile"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "50%",
              marginRight: "14px",
              background: `linear-gradient(50deg, ${randomColor()} 0%, ${randomColor()} 35%, ${randomColor()} 100%)`,
            }}
          />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: "15px", color: "#bbb", fontWeight: 500 }}>
              {`scr0ller_${Math.round(Math.random(2) * 100)}`}
            </p>
            <p style={{ margin: 0, fontSize: "17px", color: "white", fontWeight: 400 }}>
              {formatBoldText(comment)}
            </p>
            <div style={{ display: "flex" }}>
              <p
                style={{
                  fontSize: "13px",
                  color: "#aaa",
                  margin: "0px 16px 0px 0px",
                }}
              >
                {comment.length} likes
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "13px",
                  color: "#aaa",
                  cursor: "pointer",
                }}
              >
                Reply
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Comments;