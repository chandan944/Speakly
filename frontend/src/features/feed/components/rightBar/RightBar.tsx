import { useEffect, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Heading,
 
  Stack,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useNavigate, useParams } from "react-router-dom";
import { request } from "../../../../utils/api";
import type { IConnection } from "../../../network/components/connection/Connection";
import { FaUserFriends } from "react-icons/fa";
import type { User } from "../../../authentication/context/AuthenticationContextProvider";

export default function RightSidebar() {

  const [suggestions, setSuggestions] = useState<User[]>([]);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    request<User[]>({
      endpoint: "/api/v1/networking/suggestions",
      onSuccess: (data) => {
        const shuffled = data.sort(() => 0.5 - Math.random());
        setSuggestions(shuffled.slice(0, 2));
      },
      onFailure: (error) => console.log(error),
    });
  }, []);

  const bg = useColorModeValue("white", "gray.800");
  const border = useColorModeValue("gray.200", "gray.600");
  const nameColor = useColorModeValue("gray.800", "white");



  return (
    <Box
      p={4}
      bg={bg}
      borderRadius="xl"
      boxShadow="md"
      border="1px solid"
      borderColor={border}
    >
      <Heading fontSize="lg" mb={4}>
        Add to Friend 
      </Heading>

      <Stack spacing={4}>
        {suggestions.filter((s) => s.id != id).map((suggestion) => (
          <Flex
            key={suggestion.id}
            align="center"
            p={3}
            borderRadius="lg"
            border="1px solid"
            borderColor={border}
          >
            {/* Avatar Button */}
            <Button
              onClick={() => navigate("/profile/" + suggestion.id)}
              variant="ghost"
              p={0}
              borderRadius="full"
              mr={1}
            >
               <Avatar
                    size="sm"
                    src={
                      suggestion.profilePicture
                        ? suggestion.profilePicture.startsWith("http")
                          ? suggestion.profilePicture
                          : `${import.meta.env.VITE_API_URL}/api/v1/storage/${
                              suggestion.profilePicture
                            }`
                        : "/avatar.svg"
                    }
                    name={`${suggestion.firstName} ${suggestion.lastName}`}
                  />
            </Button>

            {/* Content */}
            <Box flex="1">
              <Button
                onClick={() => navigate("/profile/" + suggestion.id)}
                variant="link"
                p={0}
                _hover={{ textDecoration: "none" }}
              >
                <Text  color={nameColor}>
                  {suggestion.firstName} {suggestion.lastName}
                </Text>
              </Button>
              {/* Optional position/company */}
              <Text fontSize="sm" color="gray.500">
                {suggestion.nativeLanguage}
              </Text>
            </Box>

            {/* Connect Button */}
            <Button
              size="sm"
              colorScheme="green"
              onClick={() => {
                request<IConnection>({
                  endpoint: "/api/v1/networking/connections?recipientId=" + suggestion.id,
                  method: "POST",
                  onSuccess: () => {
                    setSuggestions(suggestions.filter((s) => s.id !== suggestion.id));
                  },
                  onFailure: (error) => console.log(error),
                });
              }}
            >
             + <FaUserFriends/>
            </Button>
          </Flex>
        ))}

        {suggestions.length === 0 && (
          <Box textAlign="center" py={4}>
            <Text color="gray.500">No suggestions available at the moment.</Text>
          </Box>
        )}
      </Stack>
    </Box>
  );
}
