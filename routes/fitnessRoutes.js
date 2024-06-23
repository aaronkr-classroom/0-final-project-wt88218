// routes/courseRoutes.js
"use strict";

/**
 * Listing 26.1 (p. 380)
 * @TODO: Course 라우트의 courseRoutes.js로의 이동
 */
const router = require("express").Router(),
  fitnessesController = require("../controllers/fitnessesController");

/**
 * Courses
 */
router.get("/", fitnessesController.index, fitnessesController.indexView); // index 라우트 생성
router.get("/new", fitnessesController.new); // 생성 폼을 보기 위한 요청 처리
router.post(
  "/create",
  fitnessesController.create,
  fitnessesController.redirectView
); // 생성 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.get("/:id", fitnessesController.show, fitnessesController.showView);
router.get("/:id/edit", fitnessesController.edit); // viewing을 처리하기 위한 라우트 추가
router.put(
  "/:id/update",
  fitnessesController.update,
  fitnessesController.redirectView
); // 편집 폼에서 받아온 데이터의 처리와 결과를 사용자 보기 페이지에 보여주기
router.delete(
  "/:id/delete",
  fitnessesController.delete,
  fitnessesController.redirectView
);

module.exports = router;
