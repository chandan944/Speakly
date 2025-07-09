import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Text,
  VStack,
  useOutsideClick,

  useColorMode,
  
} from "@chakra-ui/react";

import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthentication } from "../../../../features/authentication/context/AuthenticationContextProvider";

export function MyProfile() {
  const { logout, user } = useAuthentication();
  const navigate = useNavigate();
  const ref = useRef(null);
  const [open, setOpen] = useState(false);
  const { colorMode } = useColorMode();
  useOutsideClick({
    ref,
    handler: () => setOpen(false),
  });

  const toggleDropdown = () => {
    setOpen((prev) => !prev);
  };

  const avatarUrl = user?.profilePicture
    ? `${import.meta.env.VITE_API_URL}/api/v1/storage/${user.profilePicture}`
    : "/avatar.svg";

  return (
    <Box position="relative" ref={ref}>
      {/* 🔘 Avatar Button */}
      <Flex
        align="center"
        cursor="pointer"
        onClick={toggleDropdown}
        pr={4}
        gap={1}
       
        
        
      >
        <Avatar size="sm" name={user?.firstName} src={avatarUrl} />
        <Text size={"10px"}>
          {user?.firstName} {user?.lastName?.charAt(0)}.
        </Text>
      </Flex>

      {/* ⬇️ Dropdown Menu */}
      {open && (
        <Box
          bg={colorMode === "light" ? "whiteAlpha.900" : "gray.900"}
          color={colorMode === "light" ? "gray.900" : "whiteAlpha.900"}
           boxShadow="md"
          borderBottom="1px solid"
                   position="absolute"
          top="3.5rem"
          right="0"
           border="1px solid"
          
          borderRadius="md"
          
          w="72"
          zIndex="10"
          p={4}
        >
          <Flex align="center" gap={4} mb={4}>
            <Avatar size="lg" name={user?.firstName} src={avatarUrl} />
            <Box>
              <Text>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text fontSize="sm" color="gray.500">
                I ma a
              </Text>
            </Box>
          </Flex>

          <Divider my={2} />

          <VStack align="stretch" spacing={2}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setOpen(false);
                navigate(`/profile/${user?.id}`);
              }}
            >
              View Profile
            </Button>
            <Button
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={() => {
                setOpen(false);
                logout();
              }}
            >
              Sign Out
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
}
