package com.hoidap.hoidapdemo.entity.enums;

public enum QuestionStatus {
    PENDING(0, "Chá» tráº£ lá»i"),
    ANSWER(1, "ÄÃ£ tráº£ lá»i"),
    REPORTED(2, "Bá»‹ bÃ¡o cÃ¡o");

    private final int code;
    private final String description;

    QuestionStatus(int code, String description) {
        this.code = code;
        this.description = description;
    }

    public int getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static QuestionStatus fromCode(int code) {
        for (QuestionStatus status : QuestionStatus.values()) {
            if (status.getCode() == code) {
                return status;
            }
        }
        throw new IllegalArgumentException("Invalid status code: " + code);
    }
}

