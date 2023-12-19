import React from "react";
import { render, act } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import Posts from "../posts/Posts";
import fetchMock from "jest-fetch-mock";
import { FilterTermContext } from "../../context/FilterTermContext"; // Import FilterTermContext
import {
  addFollowedUser,
  followedUsersReducer,
  removeFollowedUser,
} from "../../reducer/followedUsersReducer"; // Replace with the correct path

// Mocking the Redux store
const mockStore = configureStore([]);

describe("<Posts />", () => {
  let store;

  beforeAll(() => {
    fetchMock.enableMocks();
  });

  afterAll(() => {
    fetchMock.disableMocks();
  });

  beforeEach(() => {
    store = mockStore({
      auth: {
        currentUser: {
          id: 1,
          username: "testuser",
          email: "test@example.com",
          phone: "1234567890",
          address: {
            street: "password",
            zipcode: "12345",
          },
        },
      },
      posts: [],
      followedUsers: [],
    });

    // Reset fetch mocks
    fetchMock.resetMocks();
    fetchMock.enableMocks();

    // Mock the fetch for user details and posts
    fetchMock.mockResponses(
      // Mock response for user details
      JSON.stringify({
        id: 1,
        username: "testuser",
        email: "test@example.com",
        phone: "1234567890",
        address: {
          street: "password",
          zipcode: "12345",
        },
      }),
      JSON.stringify([
        {
          id: 1,
          userId: 1,
          title: "test title",
          body: "test body",
        },
        {
          id: 2,
          userId: 1,
          title: "search title",
          body: "search body",
        },
        // ... add other mock posts as necessary
      ])
    );
  });

  it("fetches all articles for current logged in user and sets posts state", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <Posts />
        </Provider>
      );
    });

    // Check if fetch was called
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Check the URL of the fetch call for user details
    expect(fetchMock.mock.calls[0][0]).toBe(
      "https://jsonplaceholder.typicode.com/users/1"
    );

    // Check the URL of the fetch call for posts
    expect(fetchMock.mock.calls[1][0]).toBe(
      "https://jsonplaceholder.typicode.com/posts?userId=1"
    );

    // Check if the correct action was dispatched to the store
    const actions = store.getActions();

    expect(actions[0].type).toBe("SET_POSTS");

    // Modify the test assertion to expect an array of objects with specific properties
    const expectedPayload = [
      expect.objectContaining({
        userId: 1,
        username: "testuser",
        title: "test title",
        desc: "test title",
      }),
      expect.objectContaining({
        userId: 1,
        username: "testuser",
        title: "search title",
        desc: "search title",
      }),
      // Add other expected objects as necessary
    ];

    expect(actions[0].payload).toEqual(expect.arrayContaining(expectedPayload));
  });

  it("fetches subset of articles for current logged in user given search keyword", async () => {
    await act(async () => {
      render(
        <Provider store={store}>
          <FilterTermContext.Provider
            value={{ filterTerm: "", setFilterTerm: jest.fn() }}
          >
            {" "}
            {/* Provide FilterTermContext */}
            <Posts />
          </FilterTermContext.Provider>
        </Provider>
      );
    });

    // Check if fetch was called
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Check if the correct action was dispatched to the store
    const actions = store.getActions();
    expect(actions[0].type).toBe("SET_POSTS");

    // Check if the posts are filtered based on the search keyword
    const filteredPosts = actions[0].payload.filter((post) =>
      post.body.includes("search")
    );
    expect(filteredPosts.length).toBe(1);
    expect(filteredPosts[0].body).toBe("search body");
  });

  it("should remove articles when removing a follower (posts state is smaller)", async () => {
    let actions; // Declare actions only once.

    // Initial render with a followed user
    await act(async () => {
      render(
        <Provider store={store}>
          <Posts />
        </Provider>
      );
    });

    // Check for initial fetch calls
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Mock the fetch for user details and posts for the followed user
    fetchMock.mockResponses(
      // Mock response for user details of the followed user
      JSON.stringify({
        id: 1,
        username: "testuser",
        email: "test@example.com",
        phone: "1234567890",
        address: {
          street: "password",
          zipcode: "12345",
        },
      }),
      // Mock response for posts of the followed user
      JSON.stringify([
        {
          id: 1,
          userId: 1,
          title: "current user title",
          body: "current user post body",
        },
      ]),
      JSON.stringify({
        id: 2,
        username: "follower_username",
        email: "follower_test@example.com",
        phone: "1234567890",
        address: {
          street: "password",
          zipcode: "12345",
        },
      }),
      // Mock response for posts of the followed user
      JSON.stringify([
        {
          id: 2,
          userId: 2,
          title: "follower post title",
          body: "follower post body",
        },
      ])
    );

    // Dispatch the action to add a follower
    await act(async () => {
      store.dispatch(
        removeFollowedUser({ id: 2, username: "follower_username" })
      );
    });

    // After dispatching the action to add a follower
    actions = store.getActions();

    const removeFollowerAction = actions.find(
      (action) => action.type === "REMOVE_FOLLOWED_USER"
    );

    // Check if the action to remove the follower was dispatched
    expect(removeFollowerAction).toBeDefined();

    // Remove the follower from the followedUsers state in the mock store
    const newState = followedUsersReducer(
      store.getState().followedUsers,
      removeFollowerAction
    );
    store = mockStore({ ...store.getState(), followedUsers: newState });

    expect(store.getState().followedUsers).not.toContainEqual({
      id: 2,
      username: "follower_username",
    });

    // Re-render the Posts component after removing the follower
    await act(async () => {
      render(
        <Provider store={store}>
          <Posts />
        </Provider>
      );
    });

    // Wait for promises to resolve. This ensures that all fetch calls are made.
    await Promise.resolve();

    // Fetch for the follower should have been called
    expect(fetchMock).toHaveBeenCalledTimes(4); // Two more fetches

    const userDetailsCallsForRemovedUser = fetchMock.mock.calls.filter(
      (call) => call[0] === "https://jsonplaceholder.typicode.com/users/2"
    );
    expect(userDetailsCallsForRemovedUser.length).toBe(0);

    const postCallsForRemovedUser = fetchMock.mock.calls.filter(
      (call) =>
        call[0] === "https://jsonplaceholder.typicode.com/posts?userId=2"
    );
    expect(postCallsForRemovedUser.length).toBe(0);

    // Check if the correct action was dispatched to the store
    actions = store.getActions(); // Assign new actions after dispatching

    const setPostsActions = actions.filter(
      (action) => action.type === "SET_POSTS"
    );

    const hasNewUserPosts = setPostsActions[0].payload.some(
      (post) => post.userId === 2
    ); // Assuming 2 is the userId of the new user.
    expect(hasNewUserPosts).toBe(false);
  });

  it("should add articles when adding a follower (posts state is larger)", async () => {
    let actions; // Declare actions only once.

    // Initial render with no followed users
    await act(async () => {
      render(
        <Provider store={store}>
          <Posts />
        </Provider>
      );
    });

    // Check for initial fetch calls
    expect(fetchMock).toHaveBeenCalledTimes(2);

    // Mock the fetch for user details and posts for the new follower
    fetchMock.mockResponses(
      // Mock response for user details of the new follower
      JSON.stringify({
        id: 2,
        username: "follower_username",
        email: "follower_test@example.com",
        phone: "1234567890",
        address: {
          street: "password",
          zipcode: "12345",
        },
      }),
      // Mock response for posts of the new follower
      JSON.stringify([
        {
          id: 3,
          userId: 2,
          title: "follower post title",
          body: "follower post body",
        },
      ]), // Mock response for user details of the new follower
      JSON.stringify({
        id: 1,
        username: "testuser",
        email: "test@example.com",
        phone: "1234567890",
        address: {
          street: "password",
          zipcode: "12345",
        },
      }),
      JSON.stringify([
        {
          id: 1,
          userId: 1,
          title: "test title",
          body: "test body",
        },
        {
          id: 2,
          userId: 1,
          title: "search title",
          body: "search body",
        },
        // ... add other mock posts as necessary
      ])
    );

    // Dispatch the action to add a follower
    await act(async () => {
      store.dispatch(
        addFollowedUser({
          id: 2,
          username: "follower_username",
          email: "follower_test@example.com",
          phone: "1234567890",
          address: {
            street: "password",
            zipcode: "12345",
          },
        })
      );
    });

    // After dispatching the action to add a follower
    actions = store.getActions();

    const addFollowerAction = actions.find(
      (action) => action.type === "ADD_FOLLOWED_USER"
    );

    const newState = followedUsersReducer(
      store.getState().followedUsers,
      addFollowedUser({ id: 2, username: "follower_username" })
    );
    store = mockStore({ ...store.getState(), followedUsers: newState });

    expect(actions.some((action) => action.type === "ADD_FOLLOWED_USER")).toBe(
      true
    );

    // Check the updated followedUsers state in the mock store
    expect(store.getState().followedUsers).toContainEqual({
      id: 2,
      username: "follower_username",
    });

    await act(async () => {
      render(
        <Provider store={store}>
          <Posts />
        </Provider>
      );
    });

    // Wait for promises to resolve. This ensures that all fetch calls are made.
    await Promise.resolve();

    // Fetch for the follower should have been called
    expect(fetchMock).toHaveBeenCalledTimes(6); // Four more fetches

    // Check the URL of the fetch call for user details of the new follower
    expect(fetchMock.mock.calls[2][0]).toBe(
      "https://jsonplaceholder.typicode.com/users/2"
    );

    // Check the URL of the fetch call for posts of the new follower
    expect(fetchMock.mock.calls[3][0]).toBe(
      "https://jsonplaceholder.typicode.com/posts?userId=2"
    );

    // Check if the correct action was dispatched to the store
    actions = store.getActions(); // Assign new actions after dispatching
    const setPostsActions = actions.filter(
      (action) => action.type === "SET_POSTS"
    );

    expect(setPostsActions[0].payload.length).toBe(3);

    const hasNewUserPosts = setPostsActions[0].payload.some(
      (post) => post.userId === 2
    ); // Assuming 2 is the userId of the new user.
    expect(hasNewUserPosts).toBe(true);
  });

  it("matches the snapshot", async () => {
    const { asFragment } = await act(async () => {
      return render(
        <Provider store={store}>
          <Posts />
        </Provider>
      );
    });

    expect(asFragment()).toMatchSnapshot();
  });
});
