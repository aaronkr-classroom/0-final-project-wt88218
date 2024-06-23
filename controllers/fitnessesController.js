// controllers/coursesController.js
"use strict";

const Fitness = require("../models/Fitness"), // Fitness 모델 임포트
  User = require("../models/User"), // @TODO: Lesson 27.3
  httpStatus = require("http-status-codes"); // @TODO: Lesson 27 HTTP 상태 코드 요청

module.exports = {
  respondJSON: (req, res) => {
    res.json({
      status: httpStatus.OK,
      data: res.locals,
    }); // 로컬 데이터를 JSON 포맷으로 응답
  },

  // JSON 포맷으로 500 상태 코드와 에러 메시지 응답
  errorJSON: (error, req, res, next) => {
    let errorObject;

    if (error) {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: error.message,
      };
    } else {
      errorObject = {
        status: httpStatus.INTERNAL_SERVER_ERROR,
        message: "Unknown Error.",
      };
    }

    res.json(errorObject);
  },

  join: (req, res, next) => {
    let fitnessId = req.params.id, // 요청으로부터 강좌 ID 수집
      currentUser = req.user; // 요청으로부터 현재 사용자 수집

    if (currentUser) {
      // 사용자가 로그인 중인지 확인
      User.findByIdAndUpdate(currentUser, {
        $addToSet: {
          fitnesses: fitnessId, // 사용자의 강좌 배열에 강좌 ID 추가
        },
      }) // 사용자의 강좌 배열에 강좌 ID 추가
        .then(() => {
          res.locals.success = true;
          next();
        })
        .catch((error) => {
          next(error);
        });
    } else {
      next(new Error("User must log in."));
    }
  },

  filterUserFitnesses: (req, res, next) => {
    let currentUser = req.user; // 요청으로부터 현재 사용자 수집

    if (currentUser) {
      // 사용자가 로그인 중인지 확인
      let mappedFitnesses = res.locals.fitnesses.map((fitness) => {
        // 강좌 배열을 푸프로 돌며
        let userJoined = currentUser.fitnesses.some((userFitness) => {
          return userFitness.equals(fitness._id); // 사용자가 강좌에 참여했는지 확인
        });

        return Object.assign(fitness.toObject(), { joined: userJoined });
      });

      res.locals.fitnesses = mappedFitnesses;
      next();
    } else {
      next();
    }
  },

  index: (req, res, next) => {
    Fitness.find() // index 액션에서만 퀴리 실행
      .then((fitnesses) => {
        // 사용자 배열로 index 페이지 렌더링
        res.locals.fitnesses = fitnesses; // 응답상에서 사용자 데이터를 저장하고 다음 미들웨어 함수 호출
        next();
      })
      .catch((error) => {
        // 로그 메시지를 출력하고 홈페이지로 리디렉션
        console.log(`Error fetching fitnesses: ${error.message}`);
        next(error); // 에러를 캐치하고 다음 미들웨어로 전달
      });
  },
  indexView: (req, res) => {
    if (req.query.format === "json") {
      res.json(res.locals.users);
    } else {
      res.render("fitnesses/index", {
        page: "fitnesses",
        title: "All fitnesses",
      }); // 분리된 액션으로 뷰 렌더링
    }
  },

  new: (req, res) => {
    res.render("fitnesses/new", {
      page: "new-fitness",
      title: "New fitness",
    });
  },

  create: (req, res, next) => {
    let fitnessParams = {
      title: req.body.title,
      description: req.body.description,
      maxStudents: req.body.maxStudents,
      cost: req.body.cost,
    };
    // 폼 파라미터로 사용자 생성
    Fitness.create(fitnessParams)
      .then((fitness) => {
        res.locals.redirect = "/fitnesses";
        res.locals.fitness = fitness;
        next();
      })
      .catch((error) => {
        console.log(`Error saving fitness: ${error.message}`);
        next(error);
      });
  },

  redirectView: (req, res, next) => {
    let redirectPath = res.locals.redirect;
    if (redirectPath) res.redirect(redirectPath);
    else next();
  },

  show: (req, res, next) => {
    let fitnessId = req.params.id; // request params로부터 사용자 ID 수집
    Fitness.findById(fitnessId) // ID로 사용자 찾기
      .then((fitness) => {
        res.locals.fitness = fitness; // 응답 객체를 통해 다음 믿들웨어 함수로 사용자 전달
        next();
      })
      .catch((error) => {
        console.log(`Error fetching fitness by ID: ${error.message}`);
        next(error); // 에러를 로깅하고 다음 함수로 전달
      });
  },

  showView: (req, res) => {
    res.render("fitnesses/show", {
      page: "fitness-details",
      title: "fitness Details",
    });
  },

  edit: (req, res, next) => {
    let fitnessId = req.params.id;
    Fitness.findById(fitnessId) // ID로 데이터베이스에서 사용자를 찾기 위한 findById 사용
      .then((fitness) => {
        res.render("fitnesses/edit", {
          fitness: fitness,
          page: "edit-fitness",
          title: "Edit fitness",
        }); // 데이터베이스에서 내 특정 사용자를 위한 편집 페이지 렌더링
      })
      .catch((error) => {
        console.log(`Error fetching fitness by ID: ${error.message}`);
        next(error);
      });
  },

  update: (req, res, next) => {
    let fitnessId = req.params.id,
      fitnessParams = {
        title: req.body.title,
        description: req.body.description,
        maxStudents: req.body.maxStudents,
        cost: req.body.cost,
      }; // 요청으로부터 사용자 파라미터 취득

    Fitness.findByIdAndUpdate(fitnessId, {
      $set: fitnessParams,
    }) //ID로 사용자를 찾아 단일 명령으로 레코드를 수정하기 위한 findByIdAndUpdate의 사용
      .then((fitness) => {
        res.locals.redirect = `/fitnesses/${fitnessId}`;
        res.locals.fitness = fitness;
        next(); // 지역 변수로서 응답하기 위해 사용자를 추가하고 다음 미들웨어 함수 호출
      })
      .catch((error) => {
        console.log(`Error updating fitness by ID: ${error.message}`);
        next(error);
      });
  },

  delete: (req, res, next) => {
    let fitnessId = req.params.id;
    Fitness.findByIdAndRemove(fitnessId) // findByIdAndRemove 메소드를 이용한 사용자 삭제
      .then(() => {
        res.locals.redirect = "/fitnesses";
        next();
      })
      .catch((error) => {
        console.log(`Error deleting fitnesses by ID: ${error.message}`);
        next();
      });
  },
};
