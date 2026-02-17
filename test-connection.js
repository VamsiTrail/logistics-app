const sql = require('mssql');

const config = {
  server: "DCC7XQ14",
  database: "VM_LOCAL",
  user: "sa",
  password: "vermeiren",
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
