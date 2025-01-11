function Comments({ comment, formatBoldText, randomColor, showComments }) {
    return (
      <div
        style={{
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0",
          
          maxHeight: "300px",
          overflowY: "auto",
          transition: "max-height 0.5s ease-in-out",
          zIndex: "1",
          background: "#fff",
          padding: "10px",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          borderBottomLeftRadius: "10px",
          borderBottomRightRadius: "10px",
        }}
      >
        {comment?.map((comment, index) => (
          <div key={index} style={{ display: "flex", padding: "10px 0px" }}>
            <div
              alt="Profile"
              style={{
                width: "25px",
                height: "25px",
                borderRadius: "50%",
                marginRight: "10px",
                background: `linear-gradient(50deg, ${randomColor()} 0%, ${randomColor()} 35%, ${randomColor()} 100%)`,
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: "11px", color: "gray" }}>
                {`scr0ller_${Math.round(Math.random(2) * 100)}`}
              </p>
              <p style={{ margin: 0, fontSize: "12px" }}>
                {formatBoldText(comment)}
              </p>
              <div style={{display:"flex"}}>
                <p style={{fontSize: "10px", color: "gray", margin:"0px 10px 0px 0px" }}>
                  {comment.length} likes
                </p>
                <p style={{ margin: 0, fontSize: "10px", color: "gray", cursor:"pointer"}}>
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