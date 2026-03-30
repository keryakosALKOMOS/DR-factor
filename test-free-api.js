const fs = require('fs');

async function testHercai() {
  try {
    console.log("Testing Hercai...");
    const res = await fetch("https://hercai.onrender.com/v3/text2image?prompt=A+red+cat");
    const data = await res.json();
    console.log("Hercai response:", data);
    return data.url;
  } catch(e) { console.log("Hercai failed"); return null; }
}

async function testAirforce() {
  try {
    console.log("Testing Airforce...");
    // returns image directly
    const res = await fetch("https://api.airforce/generate?prompt=A+red+cat");
    console.log("Airforce status:", res.status);
    if(res.ok) {
        console.log("Airforce Content-Type:", res.headers.get('content-type'));
        return "Airforce success";
    }
  } catch(e) { console.log("Airforce failed"); return null; }
}

async function testAll() {
  await testHercai();
  await testAirforce();
}

testAll();
