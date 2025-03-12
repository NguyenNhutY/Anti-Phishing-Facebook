const { chromium } = require("playwright");

function getRandomEmail() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(8)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('') + "@example.com";
}

function getRandomPassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    return [...Array(12)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function spamFakeLogin(fakeUrl, times = 10000, concurrency = 5) {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log(`🔹 Đang spam vào ${fakeUrl}`);
    await page.goto(fakeUrl);

    let tasks = [];
    for (let i = 0; i < times; i++) {
        if (tasks.length >= concurrency) {
            await Promise.all(tasks);
            tasks = [];
        }

        tasks.push((async () => {
            let email = getRandomEmail();
            let password = getRandomPassword();

            await page.fill('input[name="email"], input[name="username"]', email);
            await page.fill('input[name="pass"], input[name="password"]', password);
            await page.click('button[type="submit"], input[type="submit"]');

            console.log(`📌 [${i + 1}/${times}] Spam với: ${email} | ${password}`);

            await page.waitForTimeout(500);
        })());
    }

    await Promise.all(tasks);
    await browser.close();
    console.log("✅ Hoàn thành spam login!");
}

// Chạy spam vào trang giả mạo (thay thế bằng URL thật)
spamFakeLogin("https://www.facebook.com/login", 10000, 10).catch(err => console.error("❌ Lỗi:", err));
