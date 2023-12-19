import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { createStore } from "redux";
import Navbar from "../navbar/Navbar";
import authReducer from "../../reducer/authReducer";
import { BrowserRouter as Router } from "react-router-dom";

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

describe("Navbar Component", () => {
  // Before each test, clear all jest mock function calls
  beforeEach(() => {
    mockNavigate.mockClear();
    mockDispatch.mockClear();
  });

  it("logs out the user when the 'Logout' button is clicked", () => {
    // Create a mock Redux store with an initial state
    const mockState = {
      auth: {
        currentUser: {
          id: "1",
          username: "testUser",
          profilePic: "testPic.png",
        },
        isLoggedIn: true,
        profilePic: "testPic.png",
      },
    };

    const store = createStore(authReducer, mockState);

    // Render the Navbar component with the mock store and Router
    const { getByText } = render(
      <Provider store={store}>
        <Router>
          <Navbar />
        </Router>
      </Provider>
    );

    // Simulate user interactions
    const profileDropdown = getByText("testUser");
    fireEvent.click(profileDropdown);

    const logoutButton = getByText("Logout");
    fireEvent.click(logoutButton);

    // Assertions to check expected behavior
    expect(mockDispatch).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/login");
  });

  it("matches the snapshot", () => {
    const mockState = {
      auth: {
        currentUser: {
          id: "1",
          username: "testUser",
          profilePic: "testPic.png",
        },
        isLoggedIn: true,
        profilePic: "testPic.png",
      },
    };

    const store = createStore(authReducer, mockState);

    const tree = render(
      <Provider store={store}>
        <Router>
          <Navbar />
        </Router>
      </Provider>
    );

    expect(tree).toMatchSnapshot();
  });
});
