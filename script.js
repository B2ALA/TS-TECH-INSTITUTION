const API = "http://localhost:5000";

let currentUser = null;


function showSection(id){

    document.querySelectorAll("section")
    .forEach(sec => {
        sec.style.display = "none";
    });

    document.getElementById(id).style.display = "block";
}


// ================= SIGNUP =================

async function signup(){

    const data = {

        name:name.value,
        email:email.value,
        phone:phone.value,
        username:username.value,
        password:password.value

    };

    const res = await fetch(`${API}/signup`, {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(data)

    });

    const result = await res.json();

    alert(result.message);
}


// ================= LOGIN =================

async function login(){

    const data = {

        username:loginUsername.value,
        password:loginPassword.value

    };

    const res = await fetch(`${API}/login`, {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify(data)

    });

    const result = await res.json();

    if(result.success){

        currentUser = result.user;

        alert("Login Success");

        loadCourses();

    } else {

        alert("Invalid Login");

    }
}


// ================= LOAD COURSES =================

async function loadCourses(){

    showSection("courses");

    const res = await fetch(`${API}/courses`);

    const data = await res.json();

    courseContainer.innerHTML = "";

    data.forEach(course => {

        courseContainer.innerHTML += `

        <div class="course-card">

            <h3>${course.name}</h3>

            <p>Price: ${course.price}</p>

            <p>Mode: ${course.mode}</p>

            <button onclick='registerCourse(
                "${course.name}",
                "${course.mode}",
                "${course.price}"
            )'>
                Enroll
            </button>

        </div>

        `;
    });
}


// ================= REGISTER COURSE =================

async function registerCourse(name, mode, amount){

    if(!currentUser){

        alert("Please Login");

        return;
    }

    const payment_mode = prompt(
        "Enter Payment Mode"
    );

    const res = await fetch(`${API}/register-course`, {

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({

            user_id:currentUser.id,
            course_name:name,
            mode,
            payment_mode,
            amount

        })

    });

    const result = await res.json();

    alert(result.message);
}


// ================= MY COURSES =================

async function loadMyCourses(){

    showSection("mycourses");

    const res = await fetch(
        `${API}/my-courses/${currentUser.id}`
    );

    const data = await res.json();

    myCourseBody.innerHTML = "";

    data.forEach(c => {

        myCourseBody.innerHTML += `

        <tr>

            <td>${c.course_name}</td>

            <td>${c.mode}</td>

        </tr>

        `;
    });
}


// ================= PAYMENTS =================

async function loadPayments(){

    showSection("payments");

    const res = await fetch(
        `${API}/payments/${currentUser.id}`
    );

    const data = await res.json();

    paymentBody.innerHTML = "";

    data.forEach(p => {

        paymentBody.innerHTML += `

        <tr>

            <td>${p.course_name}</td>

            <td>${p.amount}</td>

            <td>${p.payment_mode}</td>

        </tr>

        `;
    });
}


// ================= DEFAULT =================

showSection("login");


// ================= AUTO REFRESH =================

setInterval(() => {

    if(currentUser){

        loadMyCourses();
        loadPayments();

    }

}, 5000);
