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
            "an@gmail.local",
            "Asia/Ho_Chi_Minh",
            CurrencyCode.VND,
            bCryptPasswordEncoder.encode("12345678")
        );

        User secondaryUser = ensureUser(
            "Tran Minh Chau",
            "chau@gmail.local",
            "Asia/Ho_Chi_Minh",
            CurrencyCode.VND,
            bCryptPasswordEncoder.encode("12345678")
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

        ensureIncome(primaryUser, salary, new BigDecimal("25000000.00"), LocalDate.now().minusDays(24), "Luong thang nay");
        ensureIncome(primaryUser, bonus, new BigDecimal("3500000.00"), LocalDate.now().minusDays(15), "Thuong dat KPI quy");
        ensureIncome(primaryUser, freelance, new BigDecimal("4800000.00"), LocalDate.now().minusDays(8), "Du an giao dien landing page");

        ensureExpense(primaryUser, food, new BigDecimal("45000.00"), LocalDate.now().minusDays(7), "Coffee sang");
        ensureExpense(primaryUser, food, new BigDecimal("120000.00"), LocalDate.now().minusDays(6), "Lunch voi dong nghiep");
        ensureExpense(primaryUser, utilities, new BigDecimal("780000.00"), LocalDate.now().minusDays(5), "Tien dien va internet");
        ensureExpense(primaryUser, entertainment, new BigDecimal("180000.00"), LocalDate.now().minusDays(4), "Netflix Premium");
        ensureExpense(primaryUser, shopping, new BigDecimal("950000.00"), LocalDate.now().minusDays(3), "Mua sam cuoi tuan");
        ensureExpense(primaryUser, transport, new BigDecimal("250000.00"), LocalDate.now().minusDays(2), "Do xang xe may");
        ensureExpense(primaryUser, health, new BigDecimal("300000.00"), LocalDate.now().minusDays(1), "Kham suc khoe dinh ky");
    }

    private User ensureUser(String fullName, String email, String timezone, CurrencyCode currencyCode, String encodedPassword) {
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
}