async function signup() {

  try {

    alert("Signup function started");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    console.log("Email:", email);

    const { data, error } =
      await supabaseClient.auth.signUp({
        email,
        password
      });

    console.log("Data:", data);
    console.log("Error:", error);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Verification email sent!");

  } catch (err) {

    console.error(err);

    alert("ERROR: " + err.message);
  }
}
