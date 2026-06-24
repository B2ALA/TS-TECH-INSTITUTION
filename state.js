/* js/state.js — shared client state. Loaded before every other module. */
const S = {
  loggedIn: false,
  user: null,
  wishlist: new Set(),
  sortMode: 'popular',
  enrolledCourses: [],
  notes: [],
  forumPosts: [],
  chatOpen: false,
  notifOpen: false,
  chatLang: 'en',
  chatWarnings: 0,
  adminPage: 1,
  adminFilter: '',
  adminRole: '',
  forumTab: 'all',
  adminAuthed: false,
  pendingSignupEmail: null, // email currently awaiting OTP verification
  quizHistory: [],
};

window.S = S;
