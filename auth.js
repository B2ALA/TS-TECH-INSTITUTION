async function signup() {

  alert("Signup function started");

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  console.log(email, password);

  const { data, error } =
    await supabaseClient.auth.signUp({
      email,
      password
    });

  console.log(data);
  console.log(error);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Verification email sent!");
}
