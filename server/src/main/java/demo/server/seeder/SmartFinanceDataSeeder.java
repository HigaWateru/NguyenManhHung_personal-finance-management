package demo.server.seeder;

import demo.server.common.enums.CategoryType;
import demo.server.common.enums.CurrencyCode;
import demo.server.entity.Category;
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

        // Generate historical data for primaryUser (past 12 months)
        for (int i = 0; i < 12; i++) {
            LocalDate monthDate = LocalDate.now().minusMonths(i);
            
            // Monthly Salary (e.g. 25th of each month)
            LocalDate salaryDate = safeDate(monthDate, 25);
            if (!salaryDate.isAfter(LocalDate.now())) {
                ensureIncome(primaryUser, salary, new BigDecimal("25000000.00"), salaryDate, "Lương tháng " + salaryDate.getMonthValue());
            }
            
            // Monthly Utilities (e.g. 5th of each month)
            LocalDate utilityDate = safeDate(monthDate, 5);
            if (!utilityDate.isAfter(LocalDate.now())) {
                ensureExpense(primaryUser, utilities, new BigDecimal("800000.00").add(new BigDecimal(10000 * (i % 5))), utilityDate, "Tiền điện nước internet tháng " + utilityDate.getMonthValue());
            }

            // Food & Drink
            ensureExpense(primaryUser, food, new BigDecimal("50000.00"), safeDate(monthDate, 3), "Cà phê sáng");
            ensureExpense(primaryUser, food, new BigDecimal("150000.00"), safeDate(monthDate, 10), "Ăn trưa đồng nghiệp");
            ensureExpense(primaryUser, food, new BigDecimal("450000.00"), safeDate(monthDate, 20), "Liên hoan gia đình");

            // Transport
            ensureExpense(primaryUser, transport, new BigDecimal("200000.00"), safeDate(monthDate, 7), "Đổ xăng xe");
            ensureExpense(primaryUser, transport, new BigDecimal("200000.00"), safeDate(monthDate, 21), "Đổ xăng xe");

            // Entertainment
            ensureExpense(primaryUser, entertainment, new BigDecimal("180000.00"), safeDate(monthDate, 15), "Netflix Premium");
            if (i % 2 == 0) {
                ensureExpense(primaryUser, entertainment, new BigDecimal("350000.00"), safeDate(monthDate, 28), "Xem phim rạp");
            }

            // Shopping (every 2 months)
            if (i % 2 == 1) {
                ensureExpense(primaryUser, shopping, new BigDecimal("1200000.00"), safeDate(monthDate, 18), "Mua sắm quần áo");
            }

            // Freelance project (every 3 months)
            if (i % 3 == 0) {
                LocalDate freelanceDate = safeDate(monthDate, 12);
                ensureIncome(primaryUser, freelance, new BigDecimal("5000000.00"), freelanceDate, "Dự án ngoài tháng " + freelanceDate.getMonthValue());
            }

            // Bonus (every 4 months)
            if (i % 4 == 0) {
                LocalDate bonusDate = safeDate(monthDate, 30);
                if (!bonusDate.isAfter(LocalDate.now())) {
                    ensureIncome(primaryUser, bonus, new BigDecimal("4000000.00"), bonusDate, "Thưởng hiệu suất tháng " + bonusDate.getMonthValue());
                }
            }
        }

        // Generate historical data for secondaryUser (past 6 months)
        Category secSalary = findCategory(secondaryUser, "Salary", CategoryType.INCOME);
        Category secFood = findCategory(secondaryUser, "Food", CategoryType.EXPENSE);
        Category secTransport = findCategory(secondaryUser, "Transport", CategoryType.EXPENSE);

        if (secSalary != null && secFood != null && secTransport != null) {
            for (int i = 0; i < 6; i++) {
                LocalDate monthDate = LocalDate.now().minusMonths(i);

                LocalDate salDate = safeDate(monthDate, 25);
                if (!salDate.isAfter(LocalDate.now())) {
                    ensureIncome(secondaryUser, secSalary, new BigDecimal("18000000.00"), salDate, "Lương fixed tháng " + salDate.getMonthValue());
                }

                ensureExpense(secondaryUser, secFood, new BigDecimal("130000.00"), safeDate(monthDate, 8), "Ăn cơm văn phòng");
                ensureExpense(secondaryUser, secFood, new BigDecimal("95000.00"), safeDate(monthDate, 18), "Trà sữa");

                ensureExpense(secondaryUser, secTransport, new BigDecimal("150000.00"), safeDate(monthDate, 12), "Đổ xăng");
            }
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
}