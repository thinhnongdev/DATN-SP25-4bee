//package com.example.server.exception;
//
//import lombok.extern.slf4j.Slf4j;
//import org.springframework.http.HttpStatus;
//import org.springframework.web.ErrorResponse;
//import org.springframework.web.bind.MethodArgumentNotValidException;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.ResponseStatus;
//import org.springframework.web.bind.annotation.RestControllerAdvice;
//
//import java.time.LocalDateTime;
//import java.util.List;
//import java.util.stream.Collectors;
//
//@RestControllerAdvice
//@Slf4j
//public class GlobalExceptionHandler {
//
//    @ExceptionHandler(ResourceNotFoundException.class)
//    @ResponseStatus(HttpStatus.NOT_FOUND)
//    public ErrorResponse handleResourceNotFoundException(ResourceNotFoundException ex) {
//        log.error("Resource not found exception: ", ex);
//        return new ErrorResponse(
//                HttpStatus.NOT_FOUND.value(),
//                ex.getMessage(),
//                LocalDateTime.now()
//        );
//    }
//
//    @ExceptionHandler(ValidationException.class)
//    @ResponseStatus(HttpStatus.BAD_REQUEST)
//    public ErrorResponse handleValidationException(ValidationException ex) {
//        log.error("Validation exception: ", ex);
//        return new ErrorResponse(
//                HttpStatus.BAD_REQUEST.value(),
//                ex.getMessage(),
//                LocalDateTime.now()
//        );
//    }
//
//    @ExceptionHandler(MethodArgumentNotValidException.class)
//    @ResponseStatus(HttpStatus.BAD_REQUEST)
//    public ErrorResponse handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
//        List<String> errors = ex.getBindingResult()
//                .getFieldErrors()
//                .stream()
//                .map(FieldError::getDefaultMessage)
//                .collect(Collectors.toList());
//
//        return new ErrorResponse(
//                HttpStatus.BAD_REQUEST.value(),
//                String.join(", ", errors),
//                LocalDateTime.now()
//        );
//    }
//
//    @ExceptionHandler(Exception.class)
//    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
//    public ErrorResponse handleGlobalException(Exception ex) {
//        log.error("Internal server error: ", ex);
//        return new ErrorResponse(
//                HttpStatus.INTERNAL_SERVER_ERROR.value(),
//                "Đã xảy ra lỗi hệ thống",
//                LocalDateTime.now()
//        );
//    }
//}
