import React, { useState } from 'react';

const AdCard = ({ name, link, desc, image }) => {
    const [expanded, setExpanded] = useState(false);
    const color = '#84a817';

    const shortText = desc.length > 80 ? desc.substring(0, 80) + "..." : desc;

    return (
        <div style={{ display: 'flex', flexDirection: "row", marginLeft: '0%', width: "100%", justifyContent: 'center' }}>
            <div
                style={{
                    height: "80vh",
                    width: "95%",
                    background: `${color}08`,
                    margin: "50px 0px",
                    borderRadius: "10px",
                    boxShadow: "0px 0px 4px 1px gainsboro",
                    padding: "10px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    position: "relative",
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
                    </div>

                    {/* Image Container */}
                    <div style={{ marginTop: '2%', width: '370px', position: 'relative' }}>
                        <img
                            src={image}
                            alt="Ad Image"
                            style={{
                                width: '100%',
                                height: '75vh',
                                borderRadius: '20px',
                                objectFit: 'cover'
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            bottom: '10px',
                            left: '5px',
                            display: 'flex',
                            flexDirection: 'column',
                            paddingLeft: '15px',
                            paddingRight: '10%',
                            paddingTop: '10px',
                            paddingBottom: '10px',
                            borderRadius: '10px',
                            color: 'white',
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                                {/* Profile Image */}
                                <img
                                    src="https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small_2x/profile-icon-design-free-vector.jpg"
                                    style={{
                                        width: '20px',
                                        height: '20px',
                                        borderRadius: '50%',
                                        marginBottom: '5px'
                                    }}
                                    alt="Profile"
                                />
                                <div style={{ marginLeft: '3%' }}>•</div>

                                {/* Name */}
                                <div style={{
                                    marginLeft: '3%',
                                    fontSize: '14px',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    {name}
                                </div>

                                <div style={{ marginLeft: '3%' }}>•</div>

                                {/* Link Button */}
                                <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        backgroundColor: 'rgba(0, 0, 0, 0.6)',
                                        color: 'white',
                                        padding: '5px 10px',
                                        borderRadius: '5px',
                                        fontSize: '14px',
                                        marginLeft: '3%',
                                        textDecoration: 'none',
                                        boxShadow: '2px 2px 4px rgba(0, 0, 0, 0.4)',
                                        transition: 'background 0.3s ease',
                                    }}
                                    onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.8)'}
                                    onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(0, 0, 0, 0.6)'}
                                >
                                    Link
                                </a>
                            </div>

                            {/* Description with Read More */}
                            <div style={{ fontSize: '12px', marginTop: '5px' }}>
                                {expanded ? desc : shortText}
                                <span
                                    onClick={() => setExpanded(!expanded)}
                                    style={{
                                        color: color,
                                        cursor: 'pointer',
                                        fontWeight: 'bold',
                                        marginLeft: '5px',
                                    }}
                                >
                                    {expanded ? "Read Less" : "Read More"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdCard;
