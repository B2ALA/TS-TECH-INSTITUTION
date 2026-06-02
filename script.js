let currentUser = localStorage.getItem("user") || null;

// ===== NAVIGATION =====
function show(id){
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ===== COURSES =====
const courses = [
  {name:"C Programming", price:"100000"},
  {name:"Python", price:"15000"},
  {name:"Java", price:"18000"},
  {name:"AI", price:"50000"},
  {name:"IoT & Robotics", price:"55000"}
];

function loadCourses(){
  let div = document.getElementById("courseList");
  div.innerHTML = "";

  courses.forEach(c=>{
    let box = document.createElement("div");
    box.className = "course-card";
    box.innerHTML = `
      <h3>${c.name}</h3>
      <p>Price: ₹${c.price}</p>
      <button onclick="enroll('${c.name}', '${c.price}')">Enroll</button>
    `;
    div.appendChild(box);
  });
}

loadCourses();

// ===== SIGNUP =====
function signup(){
  let user = {
    name: suName.value,
    username: suUser.value,
    password: suPass.value
  };

  localStorage.setItem("userData", JSON.stringify(user));
  alert("Signup successful!");
  show("login");
}

// ===== LOGIN =====
function login(){
  let data = JSON.parse(localStorage.getItem("userData"));

  if(data && data.username === loginUser.value && data.password === loginPass.value){
    currentUser = data.username;
    localStorage.setItem("user", currentUser);
    alert("Login success");
    show("home");
  } else {
    alert("Invalid login");
  }
}

// ===== ENROLL =====
function enroll(name, price){
  if(!currentUser){
    alert("Please login first");
    show("login");
    return;
  }

  let courses = JSON.parse(localStorage.getItem("myCourses") || "[]");
  courses.push({name, price});
  localStorage.setItem("myCourses", JSON.stringify(courses));

  let payments = JSON.parse(localStorage.getItem("payments") || "[]");
  payments.push({name, amount:price});
  localStorage.setItem("payments", JSON.stringify(payments));

  alert("Enrolled successfully!");
}

// ===== MY COURSES =====
function loadMyCourses(){
  let data = JSON.parse(localStorage.getItem("myCourses") || "[]");
  let div = document.getElementById("myCourseList");
  div.innerHTML = "";

  data.forEach(c=>{
    div.innerHTML += `<div class="course-card">${c.name}</div>`;
  });
}

// ===== PAYMENT =====
function loadPayments(){
  let data = JSON.parse(localStorage.getItem("payments") || "[]");
  let div = document.getElementById("paymentList");
  div.innerHTML = "";

  data.forEach(p=>{
    div.innerHTML += `<div class="course-card">${p.name} - ₹${p.amount}</div>`;
  });
}

// auto refresh when opening pages
document.querySelector("[onclick=\"show('mycourses')\"]")
.addEventListener("click", loadMyCourses);

document.querySelector("[onclick=\"show('payment')\"]")
.addEventListener("click", loadPayments);
