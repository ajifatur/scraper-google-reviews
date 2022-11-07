const puppeteer = require('puppeteer');
const http = require('http');

let scrape = async () => {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disabled-setuid-sandbox']}); // Prevent non-needed issues for *NIX
    const page = await browser.newPage(); // Create request for the new page to obtain...
    const url = "https://www.google.com/maps/place/Spandiv+Digital+Solutions/@-7.0283374,110.4095784,17z/data=!4m21!1m13!4m12!1m4!2m2!1d110.4142924!2d-7.0265508!4e1!1m6!1m2!1s0x899e6ccd5b885c33:0xf51337faee27cf8e!2sSpandiv+Digital+Solutions+Kota+Semarang!2m2!1d110.4092872!2d-7.0308964!3m6!1s0x899e6ccd5b885c33:0xf51337faee27cf8e!8m2!3d-7.0308964!4d110.4092872!9m1!1b1"; // The URL...

    await page.goto(url); // Define the Maps URL to Scrape...
    await page.waitForTimeout(5000); // In case Server has JS needed to be loaded...

	const result = await page.evaluate(() => { // Let's create variables and store values...
        return Array.from(document.querySelectorAll(".jftiEf")).map((el) => {
            return {
                user: {
                    name: el.querySelector(".d4r55")?.textContent.trim(),
                    link: el.querySelector(".WNxzHc a")?.getAttribute("href"),
                    thumbnail: el.querySelector(".NBa7we")?.getAttribute("src"),
                    localGuide: el.querySelector(".RfnDt span:first-child")?.style.display === "none" ? undefined : true,
                    reviews: parseInt(el.querySelector(".RfnDt span:last-child")?.textContent.replace("·", "")),
                },
                rating: parseFloat(el.querySelector(".kvMYJc")?.getAttribute("aria-label")),
                date: el.querySelector(".rsqaWe")?.textContent.trim(),
                snippet: el.querySelector(".MyEned")?.textContent.trim(),
                likes: parseFloat(el.querySelector(".GBkF3d:nth-child(2)")?.getAttribute("aria-label")),
                images: Array.from(el.querySelectorAll(".KtCyie button")).length
                    ? Array.from(el.querySelectorAll(".KtCyie button")).map((el) => {
                        return {
                        thumbnail: getComputedStyle(el).backgroundImage.slice(5, -2),
                        };
                    })
                    : undefined,
                date: el.querySelector(".rsqaWe")?.textContent.trim(),
            };
        });
    });

	browser.close(); // Close the Browser...
	return result; // Return the results with the Review...
}

scrape().then((value) => {
	http.createServer(function(request, response) {
		let data = JSON.stringify(value);
		response.setHeader('Access-Control-Allow-Origin', '*');
		response.end(data);
	}).listen(process.env.PORT);
}).catch(error => console.log(error));
