// EditProfileModal.jsx
import React, { useState, useEffect } from "react";
import Modal from "react-modal";
import CloseIcon from "@mui/icons-material/Close";
import styled from "styled-components";
import "./EditProfileModal.scss";
import $ from "jquery";
import "bootstrap";
import { selectUser } from "../../reducer/authReducer";
import { useSelector, useDispatch } from "react-redux";

Modal.setAppElement("#root");

const customStyles = {
  content: {
    top: "50%",
    left: "50%",
    right: "auto",
    bottom: "auto",
    marginRight: "-50%",
    transform: "translate(-50%, -50%)",
    width: "600px",
    height: "500px",
    padding: "25px",
    borderRadius: "20px", // Rounded borders
    boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)", // Box shadow
  },

  closeButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "24",
    color: "#938eef",
    transition: "color 0.2s",
  },
};

const SaveButton = styled.button`
  margin-left: 0.1em;
  background-color: #938eef;
  color: white;
  border: none;
  padding: 0.4em 1em; // Relative units for padding
  font-size: 0.8em; // Relative units for font size
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  font-weight: 600;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji",
    "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  display: inline-block;
  max-width: 100px; // Adjust this as necessary to your preferred maximum width
  width: auto;

  &:hover {
    background-color: #7a75d6;
    animation: pulse 0.6s infinite;
  }
`;
const EditProfileModal = ({ isOpen, onRequestClose, user, onUpdate }) => {
  const [userNameError, setUserNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [zipCodeError, setZipCodeError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const currentUser = useSelector(selectUser);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    zipcode: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        phone: user.phone,
        zipcode: user.zipcode,
        password: user.password,
      });
    }
    $('[data-toggle="popover-username"]').popover({
      trigger: "manual",
      placement: "top",
    });
  }, [user]);

  const handleClose = () => {
    $('[data-toggle^="popover"]').popover("hide"); // This hides all popovers
    onRequestClose();
  };

  /*const checkUserName = (inputValue) => {
    if (!/^[a-z]*$/.test(inputValue[0])) {
      setUserNameError("Must start with lower case.");
      $('[data-toggle="popover-username"]')
        .attr("data-content", userNameError)
        .popover("show");
    } else if (!/^[a-z][A-Za-z0-9]*$/.test(inputValue)) {
      setUserNameError("Account name can only contain numbers and characters.");
      $('[data-toggle="popover-username"]')
        .attr("data-content", userNameError)
        .popover("show");
    } else {
      setUserNameError("");
      $('[data-toggle="popover-username"]').popover("hide");
    }
  };*/

  const checkEmail = (emailValue) => {
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailValue)) {
      setEmailError("Enter email in this format: a@b.co.");
      $('[data-toggle="popover-email"]')
        .attr("data-content", emailError)
        .popover("show");
    } else {
      setEmailError("");
      $('[data-toggle="popover-email"]').popover("hide");
    }
  };

  const checkPhone = (phoneValue) => {
    if (!/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/.test(phoneValue)) {
      setPhoneError("Enter phone in this format: 346-628-7744.");
      $('[data-toggle="popover-phone"]')
        .attr("data-content", phoneError)
        .popover("show");
    } else {
      setPhoneError("");
      $('[data-toggle="popover-phone"]').popover("hide");
    }
  };

  const checkZipCode = (zipValue) => {
    if (!/^\d{5}(-\d{4})?$/.test(zipValue)) {
      setZipCodeError("Enter zip in this format: 77030 or 77030-1234.");
      $('[data-toggle="popover-zipcode"]')
        .attr("data-content", zipCodeError)
        .popover("show");
    } else {
      setZipCodeError("");
      $('[data-toggle="popover-zipcode"]').popover("hide");
    }
  };

  const checkPassword = (passwordValue) => {
    if (passwordValue === "") {
      setPasswordError("Enter password.");
      $('[data-toggle="popover-password"]')
        .attr("data-content", passwordError)
        .popover("show");
    } else {
      setPasswordError("");
      $('[data-toggle="popover-password"]').popover("hide");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));

    /*if (name === "username") {
      checkUserName(value);
    }*/
    if (name === "email") {
      checkEmail(value);
    }
    if (name === "phone") {
      checkPhone(value);
    }
    if (name === "zipcode") {
      checkZipCode(value);
    }
    if (name === "password") {
      checkPassword(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      //!userNameError &&
      !emailError &&
      !phoneError &&
      !zipCodeError &&
      !passwordError
    ) {
      onUpdate(formData);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Edit Profile Modal"
      style={customStyles}
    >
      <button onClick={handleClose} style={customStyles.closeButton}>
        <CloseIcon />
      </button>
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          {/*<label htmlFor="username" className="form-label">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            data-toggle="popover-username"
            data-content={userNameError}
            data-placement="top"
  />*/}
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            data-toggle="popover-email"
            data-content={emailError}
            data-placement="top"
            // Disable the email input if currentUser.isThirdParty is true
            disabled={currentUser.isThirdPartyUser}
            readOnly={currentUser.isThirdPartyUser}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="phone" className="form-label">
            Phone
          </label>
          <input
            type="text"
            className="form-control"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            data-toggle="popover-phone"
            data-content={phoneError}
            data-placement="top"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="zipcode" className="form-label">
            Zipcode
          </label>
          <input
            type="text"
            className="form-control"
            id="zipcode"
            name="zipcode"
            value={formData.zipcode}
            onChange={handleChange}
            data-toggle="popover-zipcode"
            data-content={zipCodeError}
            data-placement="top"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            data-toggle="popover-password"
            data-content={passwordError}
            data-placement="top"
          />
        </div>
        <SaveButton type="submit">Save</SaveButton>
      </form>
    </Modal>
  );
};

export default EditProfileModal;
