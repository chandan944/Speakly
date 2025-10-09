import { CloseIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  CloseButton,
  Flex,
  FormControl,
  FormErrorMessage,
  Heading,
  IconButton,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";

import {
  useRef,
  useState,
  useEffect,
  type ChangeEvent,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";

import { MdAddAPhoto } from "react-icons/md";

interface IPostingMadalProps {
  showModal: boolean;
  content?: string;
  picture?: string;
  setShowModal: Dispatch<SetStateAction<boolean>>;
  onSubmit: (data: FormData) => Promise<void>;
  title: string;
}

export function Madal({
  setShowModal,
  showModal,
  onSubmit,
  content,
  picture,
  title,
}: IPostingMadalProps) {
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | undefined>();
  const [file, setFile] = useState<File | undefined>();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const bg = useColorModeValue("white", "gray.800");

  // Reset state when modal opens/closes or when it's a new post
  useEffect(() => {
    if (showModal) {
      // Only set preview to picture if we're editing (picture exists)
      // For new posts, start with no preview
      setPreview(picture);
      setFile(undefined);
      setError("");
    } else {
      // Clear everything when modal closes
      setPreview(undefined);
      setFile(undefined);
      setError("");
    }
  }, [showModal, picture]);

  function handleImageChange(e: ChangeEvent<HTMLInputElement>) {
    setError("");
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  const removeImage = () => {
    setPreview(undefined);
    setFile(undefined);
    // Clear the file input
    const fileInput = document.getElementById("file-upload") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const content = e.currentTarget.content.value;
    const formData = new FormData();

    if (file) {
      formData.append("picture", file);
    }

    if (!content) {
      setError("Content is required");
      setIsLoading(false);
      return;
    }

    formData.append("content", content);

    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setPreview(undefined);
      setFile(undefined);
      setShowModal(false);
      // Clear the textarea
      if (textareaRef.current) {
        textareaRef.current.value = "";
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={showModal} onClose={() => setShowModal(false)} isCentered>
      <ModalOverlay />
      <ModalContent bg={bg} borderRadius="xl" p={4}>
        <form onSubmit={handleSubmit}>
          {/* Header */}
          <Flex justify="space-between" align="center" mb={3}>
            <Heading size="md">{title}</Heading>
            <CloseButton
              size="sm"
              aria-label="Close"
              onClick={() => setShowModal(false)}
              variant="ghost"
            />
          </Flex>

          <ModalBody p={0}>
            <FormControl isInvalid={!!error}>
              <Textarea
                name="content"
                ref={textareaRef}
                placeholder="What do you want to talk about?"
                defaultValue={content}
                onFocus={() => setError("")}
                onChange={() => setError("")}
                mb={3}
              />

              {/* Image Upload */}
              {!preview ? (
                <label htmlFor="file-upload">
                  <Input
                    id="file-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    display="none" // hide the input
                  />
                  <IconButton
                    as="span"
                    icon={<MdAddAPhoto />}
                    aria-label="Upload Image"
                    colorScheme="teal"
                    variant="outline"
                    size="md"
                    cursor="pointer"
                  />
                </label>
              ) : (
                <Box position="relative" mb={3}>
                  <IconButton
                    icon={<CloseIcon />}
                    aria-label="Remove image"
                    position="absolute"
                    top={1}
                    right={1}
                    onClick={removeImage}
                    zIndex={1}
                    size="sm"
                    colorScheme="red"
                    variant="solid"
                  />
                  <Image
                    src={preview}
                    alt="Preview"
                    borderRadius="md"
                    w="full"
                    maxH="250px"
                    objectFit="contain"
                  />
                </Box>
              )}

              <FormErrorMessage>{error}</FormErrorMessage>
            </FormControl>

            {/* Footer */}
            <Flex justify="flex-end" mt={4}>
              <Button
                type="submit"
                colorScheme="blue"
                isLoading={isLoading}
                loadingText="Posting..."
              >
                Post
              </Button>
            </Flex>
          </ModalBody>
        </form>
      </ModalContent>
    </Modal>
  );
}