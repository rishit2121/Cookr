import React, { useEffect } from 'react';

const AdCard = (props) => {
    const { dataAdSlot } = props;
    var color= '#84a817';
    useEffect(() => {
        try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('Adsense error:', e);
        }
    }, []);
    return (
        <div style={{display:'flex', flexDirection:"row", marginLeft:'0%', width:"100%",  justifyContent:'center'  }}>
          <div
            style={{
              height: "80vh",
              width: "95%", // 95% change back
              background: `${color}08`,
              margin: "50px 0px",
              borderRadius: "10px",
              boxShadow: "0px 0px 4px 1px gainsboro",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
            //   animation: shake ? "shake 0.5s ease-out" : "none",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <p
              style={{
                margin: "0px",
                color: color,
                backgroundColor: `${color}08`,
                padding: "1px 15px",
                outline: `1px solid ${color}`,
                borderRadius: "100px",
                width: "fit-content",
              }}
            >
              Advertisement
            </p>
                <div
                  style={{
                    margin: "0px",
                    color: color,
                    backgroundColor: `${color}08`,
                    padding: "1px 15px",
                    outline: `1px solid ${color}`,
                    borderRadius: "100px",
                    width: "fit-content",
                  }}
                >
                  <div style={{display: 'flex', flexDirection:"row",  backgroundColor:'', margin: "0px", }}>
                  <p>Image</p>
    
    
         
          </div>
                </div>
                
              </div>
              <div style={{marginTop:'5%', width:'370px'}}>
              <img
    src="https://cdn.pixabay.com/photo/2023/08/18/15/02/dog-8198719_1280.jpg"
    alt="Description of Image"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover' // Ensures the image fills the container without stretching
    }}
  />
                </div>
              <ins className="adsbygoogle"
            style={{ display: "block" }}
            data-ad-client="ca-pub-8726893948639628"
            data-ad-slot={dataAdSlot}
            data-ad-format="auto"
            data-full-width-responsive="true">
        </ins>
            </div>
            
              </div>
        </div>
      );

};

export default AdCard;
