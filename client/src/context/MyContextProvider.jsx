import React, { createContext, useState } from 'react';

export const MyContext = createContext();

const MyContextProvider = ({ children }) => {
  const [basename, setBasename] = useState('/');

  return (
    <MyContext.Provider value={{ basename, setBasename }}>
      {children}
    </MyContext.Provider>
  );
};

export default MyContextProvider;