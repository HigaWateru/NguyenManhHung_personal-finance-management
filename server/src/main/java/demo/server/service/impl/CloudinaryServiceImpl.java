package demo.server.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import demo.server.exception.ApiException;
import demo.server.service.CloudinaryService;
import java.io.IOException;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {
    private final Cloudinary cloudinary;

    @Override
    public String uploadFile(MultipartFile file, String folder) {
        try {
            Map<?, ?> params = ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image"
            );
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload file to Cloudinary: " + e.getMessage());
        }
    }

    @Override
    public void deleteFile(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to delete file from Cloudinary: " + e.getMessage());
        }
    }
}