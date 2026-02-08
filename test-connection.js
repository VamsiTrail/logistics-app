const sql = require('mssql');

const config = {
  server: "localhost\\SQLEXPRESS",
  database: "MyApp",
  user: "logistics_user",
  password: "Logistics@123",
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};


async function test() {
  try {
    await sql.connect(config);
    console.log("✅ Database Connection SUCCESSFUL!");

    const result = await sql.query("SELECT GETDATE() as CurrentTime");
    console.log("Query Test Result:", result.recordset);

    await sql.close();
  } catch (err) {
    console.error("❌ Database Connection FAILED");
    console.error(err);
  }
}

test();
