

const express = require("express");
const ExpressError = require("../expressError");
const router = new express.Router();
const db = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const results = await db.query(`SELECT * FROM invoices`);
    return res.json({ invoices: results.rows });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await db.query(`SELECT * FROM  invoices WHERE id = $1`, [
      id,
    ]);
    if (results.rows.length === 0) {
      throw new ExpressError(` can't find companie with code ${id}`, 404);
    }
    return res.send({ invoices: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const results = await db.query(
      `INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id,comp_code, amt, paid, add_date, paid_date`,
      [comp_code, amt]
    );
    return res.status(201).json({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { comp_code, amt } = req.body;
    const results = await db.query(
      `UPDATE invoices SET comp_code=$1, amt=$2 WHERE id=$3 RETURNING comp_code, amt `,
      [comp_code, amt, req.params.id]
    );
    if (results.rows.length === 0) {
      throw new ExpressError(`Can't update invoice with code of {id}`, 404);
    }
    return res.send({ invoice: results.rows[0] });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const results = db.query(`DELETE FROM companies WHERE id = $1`, [
      req.params.id,
    ]);
    return res.send({ msg: "DELETED" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
