plugins {
	java
	id("org.springframework.boot") version "3.5.0"
	id("io.spring.dependency-management") version "1.1.7"
}

group = "com.Speakly"
version = "0.0.1-SNAPSHOT"

java {
	toolchain {
		languageVersion = JavaLanguageVersion.of(23)
	}
}

configurations {
	compileOnly {
		extendsFrom(configurations.annotationProcessor.get())
	}
	runtimeClasspath {
		extendsFrom(configurations.developmentOnly.get())
	}
	// ADD THIS: Force resolution strategy for SnakeYAML
	all {
		resolutionStrategy {
			eachDependency {
				if (requested.group == "org.yaml" && requested.name == "snakeyaml") {
					useTarget("org.yaml:snakeyaml:2.4")
					because("Force standard JAR instead of Android variant")
				}
			}
			// Force specific versions to avoid conflicts
			force(
				"org.yaml:snakeyaml:2.4",
				"org.jboss.logging:jboss-logging:3.6.1.Final"
			)
		}
	}
}

repositories {
	mavenCentral()
}

dependencies {
	implementation("org.springframework.boot:spring-boot-starter-data-jpa")
	implementation("org.springframework.boot:spring-boot-starter-web")
	compileOnly("org.projectlombok:lombok")
	developmentOnly("org.springframework.boot:spring-boot-devtools")
	runtimeOnly("org.postgresql:postgresql")
	annotationProcessor("org.projectlombok:lombok")
	testImplementation("org.springframework.boot:spring-boot-starter-test")
	testRuntimeOnly("org.junit.platform:junit-platform-launcher")

	// FIXED: Remove version from starter dependencies - let Spring Boot manage versions
	implementation("org.springframework.boot:spring-boot-starter-websocket")

	// Fake user - FIXED: Exclude problematic transitive dependencies
	implementation("com.github.javafaker:javafaker:1.0.1") {
		exclude(group = "org.yaml", module = "snakeyaml")
	}

	// Explicitly add SnakeYAML with correct version
	implementation("org.yaml:snakeyaml:2.4")
	implementation("me.paulschwarz:spring-dotenv:3.0.0")

	// Search dependencies
	implementation("org.hibernate.search:hibernate-search-mapper-orm:7.2.2.Final")
	implementation("org.hibernate.search:hibernate-search-backend-lucene:7.2.2.Final")
	implementation("org.jboss.logging:jboss-logging:3.6.1.Final")

	// Authentication, Gmail And Validator dependencies


	// https://mvnrepository.com/artifact/com.cloudinary/cloudinary-http44
	implementation("com.cloudinary:cloudinary-http44:1.32.2")
	implementation("com.sendgrid:sendgrid-java:4.10.3") // ✅ SendGrid SDK


	implementation("org.springframework.boot:spring-boot-starter-mail")
	implementation("org.springframework.boot:spring-boot-starter-validation")
	implementation("io.jsonwebtoken:jjwt-api:0.11.5")
	runtimeOnly("io.jsonwebtoken:jjwt-impl:0.11.5")
	runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.11.5")
}

tasks.withType<Test> {
	useJUnitPlatform()
}
