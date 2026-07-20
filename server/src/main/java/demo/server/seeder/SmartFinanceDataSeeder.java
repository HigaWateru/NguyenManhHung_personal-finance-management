package demo.server.seeder;

import demo.server.common.enums.CategoryType;
import demo.server.common.enums.CurrencyCode;
import demo.server.entity.Category;
import demo.server.entity.ExchangeRate;
import demo.server.entity.Expense;
import demo.server.entity.Income;
import demo.server.entity.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class SmartFinanceDataSeeder implements CommandLineRunner {
    private final EntityManager entityManager;
    BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder();

    @Override
    @Transactional
    public void run(String... args) {
        User primaryUser = ensureUser(
            "Nguyen Van An",
            "an@gmail.com",
            "Asia/Ho_Chi_Minh",
            CurrencyCode.VND,
            bCryptPasswordEncoder.encode("12345678"),
            "https://api.dicebear.com/7.x/adventurer/svg?seed=An"
        );

        User secondaryUser = ensureUser(
            "Tran Minh Chau",
            "chau@gmail.com",
            "Asia/Ho_Chi_Minh",
            CurrencyCode.VND,
            bCryptPasswordEncoder.encode("12345678"),
            "https://api.dicebear.com/7.x/adventurer/svg?seed=Chau"
        );

        Category salary = ensureCategory(primaryUser, "Salary", CategoryType.INCOME, "Luong hang thang");
        Category bonus = ensureCategory(primaryUser, "Bonus", CategoryType.INCOME, "Thuong hieu suat");
        Category freelance = ensureCategory(primaryUser, "Freelance", CategoryType.INCOME, "Thu nhap du an ngoai");
        Category food = ensureCategory(primaryUser, "Food", CategoryType.EXPENSE, "Chi phi an uong hang ngay");
        Category transport = ensureCategory(primaryUser, "Transport", CategoryType.EXPENSE, "Di chuyen va xang xe");
        Category shopping = ensureCategory(primaryUser, "Shopping", CategoryType.EXPENSE, "Mua sam ca nhan");
        Category entertainment = ensureCategory(primaryUser, "Entertainment", CategoryType.EXPENSE, "Giai tri cuoi tuan");
        Category health = ensureCategory(primaryUser, "Health", CategoryType.EXPENSE, "Cham soc suc khoe");
        Category utilities = ensureCategory(primaryUser, "Utilities", CategoryType.EXPENSE, "Dien nuoc va internet");

        ensureCategory(secondaryUser, "Salary", CategoryType.INCOME, "Luong co dinh");
        ensureCategory(secondaryUser, "Food", CategoryType.EXPENSE, "Bua an hang ngay");
        ensureCategory(secondaryUser, "Transport", CategoryType.EXPENSE, "Chi phi di lai");

        // Clean out sample historical incomes, expenses, and transactions to ensure clean state
        entityManager.createQuery("DELETE FROM Expense").executeUpdate();
        entityManager.createQuery("DELETE FROM Income").executeUpdate();
        entityManager.createQuery("DELETE FROM Transaction").executeUpdate();

        // Seed initial exchange rates
        ensureExchangeRate(CurrencyCode.USD, "US Dollar", "$", BigDecimal.valueOf(25450.0), BigDecimal.ZERO);
        ensureExchangeRate(CurrencyCode.EUR, "Euro", "€", BigDecimal.valueOf(27663.0), BigDecimal.valueOf(0.34));
        ensureExchangeRate(CurrencyCode.JPY, "Japanese Yen", "¥", BigDecimal.valueOf(160.5), BigDecimal.valueOf(-0.21));
        ensureExchangeRate(CurrencyCode.VND, "Vietnamese Dong", "₫", BigDecimal.ONE, BigDecimal.valueOf(0.08));

        // Seed initial notifications for demo user
        User dynamicUser = findUserByEmail("user_transactions_dynamic");
        if (dynamicUser != null) {
            ensureNotification(dynamicUser, "Đồng bộ Giao dịch Plaid", "Đã kết nối tài khoản First Platypus Bank và tự động đồng bộ 15 giao dịch.", "PLAID");
            ensureNotification(dynamicUser, "Cảnh báo Ngân sách Ăn uống", "Chi tiêu cho danh mục Ăn uống đã đạt 85% hạn mức ngân sách.", "BUDGET_WARNING");
            ensureNotification(dynamicUser, "Cập nhật Tỷ giá Ngoại tệ", "Tỷ giá thị trường đã được đồng bộ trực tuyến chuẩn USD ($1.0000 USD).", "EXCHANGE_RATE");
        }
    }


    private User ensureUser(String fullName, String email, String timezone, CurrencyCode currencyCode, String encodedPassword, String avatarUrl) {
        User existingUser = findUserByEmail(email);
        if (existingUser != null) {
            return existingUser;
        }

        User user = User.builder()
                .fullName(fullName)
                .email(email)
                .passwordHash(encodedPassword)
                .timezone(timezone)
                .currencyCode(currencyCode)
                .avatarUrl(avatarUrl)
                .active(true)
                .build();
        entityManager.persist(user);
        return user;
    }

    private Category ensureCategory(User user, String name, CategoryType type, String description) {
        Category existingCategory = findCategory(user, name, type);
        if (existingCategory != null) {
            return existingCategory;
        }

        Category category = Category.builder()
                .user(user)
                .name(name)
                .type(type)
                .description(description)
                .build();
        entityManager.persist(category);
        return category;
    }

    private void ensureIncome(User user, Category category, BigDecimal amount, LocalDate transactionDate, String note) {
        if (transactionDate.isAfter(LocalDate.now())) {
            return;
        }

        Long count = entityManager.createQuery(
            "select count(i) from Income i where i.user = :user and i.category = :category and i.amount = :amount and i.transactionDate = :transactionDate and i.note = :note",
                        Long.class
            )
            .setParameter("user", user)
            .setParameter("category", category)
            .setParameter("amount", amount)
            .setParameter("transactionDate", transactionDate)
            .setParameter("note", note)
            .getSingleResult();

        if (count > 0) {
            return;
        }

        Income income = Income.builder()
                .user(user)
                .category(category)
                .amount(amount)
                .transactionDate(transactionDate)
                .note(note)
                .build();
        entityManager.persist(income);
    }

    private void ensureExpense(User user, Category category, BigDecimal amount, LocalDate transactionDate, String note) {
        if (transactionDate.isAfter(LocalDate.now())) {
            return;
        }

        Long count = entityManager.createQuery(
                        "select count(e) from Expense e where e.user = :user and e.category = :category and e.amount = :amount and e.transactionDate = :transactionDate and e.note = :note",
                        Long.class
                )
                .setParameter("user", user)
                .setParameter("category", category)
                .setParameter("amount", amount)
                .setParameter("transactionDate", transactionDate)
                .setParameter("note", note)
                .getSingleResult();

        if (count > 0) {
            return;
        }

        Expense expense = Expense.builder()
            .user(user)
            .category(category)
            .amount(amount)
            .transactionDate(transactionDate)
            .note(note)
            .build();
        entityManager.persist(expense);
    }

    private User findUserByEmail(String email) {
        try {
            return entityManager.createQuery(
                            "select u from User u where u.email = :email",
                            User.class
                    )
                    .setParameter("email", email)
                    .getSingleResult();
        } catch (NoResultException exception) {
            return null;
        }
    }

    private Category findCategory(User user, String name, CategoryType type) {
        try {
            return entityManager.createQuery(
                            "select c from Category c where c.user = :user and c.name = :name and c.type = :type",
                            Category.class
                    )
                    .setParameter("user", user)
                    .setParameter("name", name)
                    .setParameter("type", type)
                    .getSingleResult();
        } catch (NoResultException exception) {
            return null;
        }
    }

    private LocalDate safeDate(LocalDate reference, int day) {
        int maxDays = reference.lengthOfMonth();
        int safeDay = Math.min(day, maxDays);
        return reference.withDayOfMonth(safeDay);
    }

    private void ensureExchangeRate(CurrencyCode currencyCode, String name, String symbol, BigDecimal rateToVnd, BigDecimal changePercent) {
        Long count = entityManager.createQuery(
                "select count(r) from ExchangeRate r where r.currencyCode = :currencyCode",
                Long.class
            )
            .setParameter("currencyCode", currencyCode)
            .getSingleResult();

        if (count == 0) {
            ExchangeRate rate = ExchangeRate.builder()
                .currencyCode(currencyCode)
                .currencyName(name)
                .symbol(symbol)
                .rateToVnd(rateToVnd)
                .rateChangePercent(changePercent)
                .build();
            entityManager.persist(rate);
        }
    }

    private void ensureNotification(User user, String title, String message, String type) {
        Long count = entityManager.createQuery(
                "select count(n) from Notification n where n.user = :user and n.title = :title",
                Long.class
            )
            .setParameter("user", user)
            .setParameter("title", title)
            .getSingleResult();

        if (count == 0) {
            demo.server.entity.Notification notification = demo.server.entity.Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .build();
            entityManager.persist(notification);
        }
    }
}