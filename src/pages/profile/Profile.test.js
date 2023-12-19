import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import configureStore from "redux-mock-store";
import Profile from "../profile/Profile";

// Import the EditProfileModalMock component
//import EditProfileModalMock from "../profile/EditProfileModal.mock";

// Create a mock Redux store
const mockStore = configureStore([]);
const store = mockStore({
  auth: {
    currentUser: {
      username: "testuser",
      email: "test@example.com",
      phone: "1234567890",
      zipcode: "12345",
      password: "password",
      profilePic: "https://via.placeholder.com/150",
    },
  },
});

jest.mock("../../components/modal/EditProfileModal", () => {
  // Directly return the mock component here
  return () => <div>EditProfileModalMock</div>;
});

describe("Profile Component", () => {
  it("renders the logged-in user's username", () => {
    render(
      <Provider store={store}>
        <Router>
          <Profile />
        </Router>
      </Provider>
    );

    const usernameElement = screen.getByText("testuser");

    expect(usernameElement).toBeInTheDocument();
  });

  it("matches snapshot", () => {
    const { asFragment } = render(
      <Provider store={store}>
        <Router>
          <Profile />
        </Router>
      </Provider>
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
