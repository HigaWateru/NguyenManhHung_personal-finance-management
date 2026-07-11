package demo.server.service.impl.support;

import demo.server.exception.ApiException;
import java.time.LocalDate;

public final class ServiceInputUtils {

    private ServiceInputUtils() {
    }

    public static void validateDateRange(LocalDate fromDate, LocalDate toDate) {
        if (fromDate != null && toDate != null && fromDate.isAfter(toDate)) {
            throw ApiException.badRequest("From date must be before or equal to to date");
        }
    }

    public static String normalizeOptionalText(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }
}