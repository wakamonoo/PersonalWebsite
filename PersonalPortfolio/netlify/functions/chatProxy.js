exports.handler = async function (event) {
  try {
      const requestBody = JSON.parse(event.body);

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
              Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
              "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      return {
          statusCode: 200,
          body: JSON.stringify(data),
      };
  } catch (error) {
      return {
          statusCode: 500,
          body: JSON.stringify({ error: "Internal Server Error", details: error.message }),
      };
  }
};
