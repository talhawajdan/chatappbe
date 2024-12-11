npm i express zod config cors express mongoose pino pino-pretty dayjs bcrypt jsonwebtoken lodash nanoid tsconfig-paths swagger-ui-express swagger-jsdoc 

npm i @types/body-parser @types/config @types/cors @types/express @types/node @types/pino @types/bcrypt @types/jsonwebtoken @types/lodash @types/nanoid ts-node-dev typescript -D

npx tsc --init
npm install tsconfig-paths
 npm i jsonwebtoken
 uuid
 multer
 cookie-parser 
 cloudinary
 dev depandance
 @faker-js/faker

check if the user exist


add this script to your package.json


 "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only -r tsconfig-paths/register src/app.ts",
    "build": "tsc",
    "start": "node -r tsconfig-paths/register build/app.js"
  },

features:
1) friend request
2) move the theme settings to dashboard settings
3) on signUp use must able to login 
4) settings=> profile,deleteAccount,notifications,themes


notes 
if we send the attachment thought socket is not the best practices 
if we change in the package.json type to module  we can use the import.
if you want to get  unselect field from mongodb then use select example select("+fieldName")
lean() in mongodb give us js object
bottomref.current.scrollInfoView({behavior:"smooth"})
right click event    onContextMenu={handleRightClick} on div
framer-motion 

meabhisingh



refs
import React, { useEffect, useRef, useState } from "react";

const InfiniteScrollChat = () => {
  const [messages, setMessages] = useState([]); // Array of messages
  const [loading, setLoading] = useState(false); // Loading state for fetch
  const scrollRef = useRef(null); // Reference to the scrollable container

  // Fetch messages from API
  const fetchMessages = async (prepend = false) => {
    setLoading(true);
    const newMessages = await fetchMoreMessages(); // Replace with your API call
    setMessages((prev) =>
      prepend ? [...newMessages, ...prev] : [...prev, ...newMessages]
    );
    setLoading(false);
  };

  // Scroll to the bottom of the container
  const scrollToBottom = () => {
    const container = scrollRef.current;
    container.scrollTop = container.scrollHeight;
  };

  // Handle scroll event
  const handleScroll = () => {
    const container = scrollRef.current;
    if (container.scrollTop === 0 && !loading) {
      fetchMessages(true); // Fetch more messages and prepend
    }
  };

  // Component did mount
  useEffect(() => {
    fetchMessages().then(() => {
      // Scroll to the bottom after fetching initial messages
      scrollToBottom();
    });
  }, []);

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      style={{
        height: "500px", // Adjust as needed
        overflowY: "auto",
        border: "1px solid #ccc",
      }}
    >
      {loading && <p>Loading...</p>}
      {messages.map((message, index) => (
        <div key={index}>{message}</div>
      ))}
    </div>
  );
};

// Mock API function
const fetchMoreMessages = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        "Older message 1",
        "Older message 2",
        "Older message 3",
      ]); // Replace with actual API response
    }, 1000);
  });
};

export default InfiniteScrollChat;
https://codesandbox.io/p/sandbox/infinite-scroll-top-4207b?file=%2Fsrc%2FApp.js
