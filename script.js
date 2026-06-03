let loggedInUserId = 0;
let loggedInUsername = "";

// ===== CARD LAYOUT =====
function show(page){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(page).classList.add("active");
}

// ===== COURSES (same as Java HashMap) =====
const coursesMap = {
  "C Programming": {price:"1000000", hours:40, mode:"English/Tamil"},
  "Python": {price:"15000", hours:50, mode:"English/Tamil"},
  "Java": {price:"18000", hours:60, mode:"English"},
  "AI": {price:"50000", hours:100, mode:"English"}
};

function loadCourses(){
  let container = document.getElementById("courseContainer");
  container.innerHTML = "";

  for(let name in coursesMap){
    let c = coursesMap[name];

    let div = document.createElement("div");
    div.innerHTML = `
      <h3>${name}</h3>
      <p>Price: ₹${c.price}</p>
      <button onclick="showCourse('${name}')">VIEW</button>
    `;
    container.appendChild(div);
  }
}
loadCourses();

// ===== COURSE DETAILS (Java JOptionPane replacement) =====
function showCourse(name){
  if(loggedInUserId == 0){
    alert("You must login first!");
    show("LOGIN");
    return;
  }

  let c = coursesMap[name];

  let mode = prompt("Select Payment Mode (UPI/Card/Cash/Online)");

  if(!mode) return;

  // store like DB
  let reg = JSON.parse(localStorage.getItem("registered") || "[]");
  reg.push({user:loggedInUsername, course:name, mode});
  localStorage.setItem("registered", JSON.stringify(reg));

  let pay = JSON.parse(localStorage.getItem("payments") || "[]");
  pay.push({user:loggedInUsername, course:name, amount:c.price, mode});
  localStorage.setItem("payments", JSON.stringify(pay));

  alert("Successfully Registered for " + name);
}

// ===== HOME ENROLL BUTTON =====
function enrollNow(){
  if(loggedInUserId == 0){
    let choice = confirm("Login required. OK = Login, Cancel = Signup");
    if(choice) show("LOGIN");
    else show("SIGNUP");
  } else {
    show("COURSES");
  }
}

// ===== LOGIN =====
function login(){
  let u = loginUser.value;
  let p = loginPass.value;

  let users = JSON.parse(localStorage.getItem("users") || "[]");

  let found = users.find(x => x.username === u && x.password === p);

  if(found){
    loggedInUserId = found.id;
    loggedInUsername = found.username;
    alert("Login Successful");
    show("HOME");
  } else {
    alert("Invalid Login");
  }
}

// ===== SIGNUP =====
function signup(){
  let users = JSON.parse(localStorage.getItem("users") || "[]");

  let newUser = {
    id: users.length + 1,
    name: suName.value,
    email: suEmail.value,
    phone: suPhone.value,
    username: suUser.value,
    password: suPass.value
  };

  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  alert("Signup Successful");
  show("LOGIN");
}

// ===== MY COURSES =====
function loadMyCourses(){
  let data = JSON.parse(localStorage.getItem("registered") || "[]");
  let table = document.getElementById("myCoursesTable");

  table.innerHTML = "";

  let count = 1;
  data.filter(x => x.user === loggedInUsername)
      .forEach(x => {
        table.innerHTML += `
          <tr>
            <td>${count++}</td>
            <td>${x.course}</td>
            <td>${x.mode}</td>
          </tr>
        `;
      });
}

// ===== PAYMENT =====
function loadPayments(){
  let data = JSON.parse(localStorage.getItem("payments") || "[]");
  let table = document.getElementById("paymentTable");

  table.innerHTML = "";

  data.filter(x => x.user === loggedInUsername)
      .forEach(x => {
        table.innerHTML += `
          <tr>
            <td>${x.course}</td>
            <td>${x.amount}</td>
            <td>${x.mode}</td>
          </tr>
        `;
      });
}
