const { chromium } = require("playwright");

function getRandomEmail() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    return [...Array(8)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('') + "@google.com";
}

function getRandomPassword() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()";
    return [...Array(12)].map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
}

async function spamFakeLogin(fakeUrl, times, concurrency) {
    console.log(`🔹 Đang spam vào ${fakeUrl} với ${concurrency} trình duyệt song song`);

    const browsers = [];

    // Chỉ tạo đúng số lượng trình duyệt bằng concurrency
    for (let i = 0; i < concurrency; i++) {
        browsers.push(await chromium.launch({ headless: false }));
    }

    await Promise.all(
        browsers.map(async (browser, index) => {
            const context = await browser.newContext();
            const page = await context.newPage();
            await page.goto(fakeUrl);

            for (let i = 0; i < times / concurrency; i++) {
                let email = getRandomEmail();
                let password = getRandomPassword();

                await page.evaluate((email) => {
                    let emailInput = document.querySelector('input[name="email"], input[name="username"]');
                    if (emailInput) emailInput.value = email;
                }, email);

                await page.evaluate((password) => {
                    let passInput = document.querySelector('input[name="pass"], input[name="password"]');
                    if (passInput) passInput.value = password;
                }, password);

                await Promise.all([
                    page.evaluate(() => {
                        let submitButton = document.querySelector('button[type="submit"], input[type="submit"]');
                        if (submitButton) submitButton.click();
                    }),
                    page.waitForNavigation({ waitUntil: 'networkidle' }) // Chờ trang điều hướng
                ]);

                console.log(`📌 [Browser ${index + 1}] Spam với: ${email} | ${password}`);

                await page.waitForTimeout(500); // Chờ một chút trước khi thực hiện vòng lặp tiếp theo
                await page.goto(fakeUrl); // Điều hướng lại về trang đăng nhập sau khi gửi
            }

            await browser.close();
        })
    );

    console.log("✅ Hoàn thành spam login!");
}

// Chạy trình duyệt song song
spamFakeLogin("https://facebook.com/login", 10000, 1).catch(err => console.error("❌ Lỗi:", err));
