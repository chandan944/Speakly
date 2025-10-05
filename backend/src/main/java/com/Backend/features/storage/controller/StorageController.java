package com.Backend.features.storage.controller;

import com.Backend.features.storage.service.StorageService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.method.annotation.StreamingResponseBody;

import java.io.FileInputStream;
import java.io.IOException;


//
//@RestController
//@RequestMapping("/api/v1/storage")
//public class StorageController {
//    private final StorageService storageService;
//
//    public StorageController(StorageService storageService) {
//        this.storageService = storageService;
//    }
//
//    @GetMapping("/{filename}")
//    public ResponseEntity<StreamingResponseBody> serveFile(@PathVariable String filename) throws IOException {
//        MediaType mediaType = storageService.getMediaType(filename);
//        FileInputStream resource = storageService.getFileInputStream(filename);
//
//        StreamingResponseBody stream = outputStream -> {
//            try(resource){
//                int nRead;
//                byte[] data = new byte[1024];
//                while ((nRead=resource.read(data ,0,data.length)) != -1){
//                    outputStream.write(data,0,nRead);
//                    outputStream.flush();
//                }
//            }
//        };
//        return ResponseEntity
//                .ok()
//                .header(HttpHeaders.CONTENT_DISPOSITION,"inline; filename=\"" + filename + "\"")
//                .contentType(mediaType)
//                .body(stream);
//    }
//}
















@RestController
@RequestMapping("/api/v1/storage")
public class StorageController {

    private final StorageService storageService;

    public StorageController(StorageService storageService) {
        this.storageService = storageService;
    }

    // Upload image
    @PostMapping("/upload")
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {
        String imageUrl = storageService.saveImage(file);
        return ResponseEntity.ok(imageUrl);
    }

    // Delete image (you need to pass public_id, not URL)
    @DeleteMapping("/{publicId}")
    public ResponseEntity<String> deleteImage(@PathVariable String publicId) throws IOException {
        storageService.deleteFile(publicId);
        return ResponseEntity.ok("Deleted successfully");
    }
}