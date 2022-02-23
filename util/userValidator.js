const registerValidator = (name, email, password) => {
  const error = {};
  if (name.trim() === "") {
    error.name = "Name must not be empty";
  }
  if (email.trim() === "") {
    error.email = "email must not be empty";
  } else {
    if (
      !email.match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      )
    ) {
      error.email = "email not valid";
    }
  }
  if (password.trim() === "") {
    error.password = "password must not be empty";
  } else {
    if ([...password].length < 6) {
      error.password = "password must more than 6";
    }
  }

  return {
    error,
    valid: Object.keys(error).length < 1,
  };
};

const loginValidator = (email, password) => {
  const error = {};
  if (email.trim() === "") {
    error.email = "email must not be empty";
  }
  if (password.trim() === "") {
    error.password = "password must not be empty";
  }
  return {
    error,
    valid: Object.keys(error).length < 1,
  };
};

module.exports = { registerValidator, loginValidator };
