package demo.server.service;

import demo.server.entity.Category;
import java.util.List;

public interface AiCategorizerService {
    Category categorize(String merchantName, String note, List<Category> categories);
}
