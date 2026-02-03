const users = [
  {
    // For dev
    accessToken: "iiii",
    // It's gonna be MongoDB id
    _id: "aaaaaaaa",
    email: "aaaa@aaaa.com",
    password: "11111",
    isGoogleConnected: false,
    collections: [
      { name: "Collection 1", collectionId: "abcd", numberOfWords: 1 },
      { name: "Collection 2", collectionId: "bcde", numberOfWords: 1 },
    ],
    // It's gonna be tamestamp
    createdAt: "2026/2/2",
    updatedAt: "2026/2/2",
  },
  {
    // For dev
    accessToken: "bbbb",
    // It's gonna be MongoDB id
    _id: "bbbbbbbb",
    email: "bbbb@bbbb.com",
    password: "2222",
    isGoogleConnected: false,
    collections: [
      { name: "French", collectionId: "cdef", numberOfWords: 1 },
      { name: "Frensh Business", collectionId: "defg", numberOfWords: 1 },
    ],
    // It's gonna be tamestamp
    createdAt: "2026/2/3",
    updatedAt: "2026/2/3",
  },
  {
    // For dev
    accessToken: "oooo",
    // It's gonna be MongoDB id
    _id: "cccccccc",
    email: "cccc@gmail.com",
    password: "3333",
    isGoogleConnected: true,
    collections: [
      { name: "English", collectionId: "fghi", numberOfWords: 1 },
      { name: "Spanish", collectionId: "ghik", numberOfWords: 1 },
    ],
    // It's gonna be tamestamp
    createdAt: "2026/1/29",
    updatedAt: "2026/1/29",
  },
];

export default users;
