import { createContext, useContext } from 'react';

// What pages need to know about the signed-in member.
// { isLoggedIn, email, profile, profileStatus: 'idle'|'loading'|'ready'|'error'|'unavailable', setProfile }
export const MemberContext = createContext({
  isLoggedIn: false,
  email: '',
  profile: null,
  profileStatus: 'idle',
  setProfile: () => {},
});

export const useMember = () => useContext(MemberContext);
