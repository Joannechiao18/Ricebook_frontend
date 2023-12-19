import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import Login from "../login/Login";
import authReducer from "../../reducer/authReducer";
import { BrowserRouter as Router } from "react-router-dom";
import fetchMock from "jest-fetch-mock";

// Mock the useNavigate hook from react-router-dom
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Mock the useDispatch hook from react-redux
const mockDispatch = jest.fn();
jest.mock("react-redux", () => ({
  ...jest.requireActual("react-redux"),
  useDispatch: () => mockDispatch,
}));

// Mock global alert
global.alert = jest.fn();

describe("Login Component", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    mockNavigate.mockClear();
    mockDispatch.mockClear();
    fetchMock.mockClear();
    global.alert.mockClear();

    // Mock the fetch response
    fetchMock.mockResponseOnce(
      JSON.stringify([
        {
          id: 1,
          username: "testuser",
          email: "test@example.com",
          phone: "1234567890",
          address: {
            street: "password",
            zipcode: "12345",
          },
        },
      ])
    );
  });

  it("should log in a previously registered user and navigate to root", async () => {
    // Set up initial state for the Redux store
    const initialState = {
      auth: {
        currentUser: null,
        isLoggedIn: false,
        profilePic: null,
      },
    };
    const store = createStore(authReducer, initialState);

    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <Router>
          <Login />
        </Router>
      </Provider>
    );

    // Fill in login details
    fireEvent.change(getByPlaceholderText("Username"), {
      target: { value: "testuser" },
    });
    fireEvent.change(getByPlaceholderText("Password (Street Name)"), {
      target: { value: "password" },
    });

    // Submit the form
    fireEvent.click(getByText("LOGIN"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assertions
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://jsonplaceholder.typicode.com/users?username=testuser"
    );
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("should not log in an invalid user", async () => {
    // Set up initial state for the Redux store
    const initialState = {
      auth: {
        currentUser: null,
        isLoggedIn: false,
        profilePic: null,
      },
    };
    const store = createStore(authReducer, initialState);

    const { getByPlaceholderText, getByText } = render(
      <Provider store={store}>
        <Router>
          <Login />
        </Router>
      </Provider>
    );

    // Mock a failed fetch response
    fetchMock.mockResponseOnce(
      JSON.stringify([]), // Assume no user is found with the provided credentials
      { status: 404, statusText: "Not Found" }
    );

    // Fill in login details
    fireEvent.change(getByPlaceholderText("Username"), {
      target: { value: "invaliduser" },
    });
    fireEvent.change(getByPlaceholderText("Password (Street Name)"), {
      target: { value: "invalidpassword" },
    });

    // Submit the form
    fireEvent.click(getByText("LOGIN"));

    await new Promise((resolve) => setTimeout(resolve, 0));

    // Assertions
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://jsonplaceholder.typicode.com/users?username=invaliduser"
    );
    expect(mockDispatch).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalledWith("/");
    expect(global.alert).toHaveBeenCalledWith("Incorrect username or password");
  });

  it("matches snapshot", () => {
    const initialState = {
      auth: {
        currentUser: null,
        isLoggedIn: false,
        profilePic: null,
      },
    };
    const store = createStore(authReducer, initialState);

    const tree = render(
      <Provider store={store}>
        <Router>
          <Login />
        </Router>
      </Provider>
    );

    expect(tree).toMatchSnapshot();
  });

  // ... other tests ...
});
