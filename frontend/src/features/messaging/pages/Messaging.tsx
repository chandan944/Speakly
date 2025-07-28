import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { 
  Box, 
  Flex, 
  Heading, 
  IconButton, 
  useBreakpointValue,
  useColorModeValue,
  keyframes
} from "@chakra-ui/react";
import { IoMdPersonAdd } from "react-icons/io";
import { usePageTitle } from "../../../hook/usePageTitle";
import { Conversations } from "../components/conversations/Conversations";
import RightSidebar from "../../feed/components/rightBar/RightBar";

// Subtle animation for header
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function Messaging() {
  usePageTitle("Messaging");
  const [, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();
  const creatingNewConversation = location.pathname.includes("new");
  const onConversation = location.pathname.includes("conversations");
  const navigate = useNavigate();

  // Enhanced color scheme using Chakra's color mode
  const bgColor = useColorModeValue("gray.50", "gray.900");
  const sidebarBg = useColorModeValue("white", "gray.800");
  const headerBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const headingColor = useColorModeValue("gray.800", "white");

  const isLargeScreen = useBreakpointValue({ base: false, lg: true });

  // --- Log location changes and derived state ---
  console.log("Messaging component rendered. Location:", location.pathname);
  console.log("  - creatingNewConversation:", creatingNewConversation);
  console.log("  - onConversation:", onConversation);
  console.log("  - isLargeScreen:", isLargeScreen);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      console.log("Window resized. New width:", window.innerWidth); // Log resize events
    };
    window.addEventListener("resize", handleResize);
    console.log("Resize event listener added."); // Log effect setup
    return () => {
      window.removeEventListener("resize", handleResize);
      console.log("Resize event listener removed."); // Log effect cleanup
    };
  }, []);

  const showSidebar = isLargeScreen || !creatingNewConversation;
  const showConversationsList = !(onConversation && !isLargeScreen);

  // --- Log the final visibility states for debugging ---
  console.log("Final visibility states:");
  console.log("  - showSidebar:", showSidebar);
  console.log("  - showConversationsList:", showConversationsList);

  return (
    <Flex
      direction={{ base: "column", lg: "row" }}
      h="100vh"
      overflow="hidden"
      bg={bgColor}
    >
      <Flex
        flex={1}
        overflow="hidden"
        direction={{ base: "column", lg: "row" }}
      >
        {/* Enhanced Sidebar */}
        {showSidebar && (
          <Box
            w={{ base: "100%", lg: "340px" }}
            bg={sidebarBg}
            borderRight="1px solid"
            borderColor={borderColor}
            display={showSidebar ? "block" : "none"} // Note: This might be redundant now
            overflowY="hidden"
            boxShadow="sm"
          >
            <Flex
              py={2}
              px={4}
              alignItems="center"
              justifyContent="space-between"
              borderBottom="1px solid"
              borderColor={borderColor}
              bg={headerBg}
              animation={`${fadeIn} 0.3s ease-out`}
            >
              <Heading 
                as="h1" 
                size="md" 
                color={headingColor}
                fontWeight="bold"
              >
                Messages
              </Heading>
              <IconButton
                aria-label="New Conversation"
                icon={<IoMdPersonAdd />}
                colorScheme="green"
                onClick={() => {
                  console.log("New Conversation button clicked. Navigating to conversations/new");
                  navigate("conversations/new");
                }}
                borderRadius="full"
                size="sm"
                boxShadow="md"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "lg"
                }}
                _active={{
                  transform: "translateY(0)"
                }}
                transition="all 0.2s cubic-bezier(.21,1.02,.73,1)"
              />
            </Flex>
            
            {/* Enhanced Conversations List Container */}
            <Box
              display={showConversationsList ? "block" : "none"} // Note: This might be redundant now
              overflowY="auto"
              h="calc(90vh - 180px)"
              py={3}
              css={{
                '&::-webkit-scrollbar': {
                  width: '4px',
                },
                '&::-webkit-scrollbar-track': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'gray.300',
                  borderRadius: '24px',
                },
              }}
            >
              <Conversations />
            </Box>
          </Box>
        )}

        {/* Enhanced Main Content Area */}
        <Box
          flex={1}
          overflowY="auto"
          // p={{ base: 3, lg: 5 }}
          bg={useColorModeValue("white", "gray.900")}
          css={{
            '&::-webkit-scrollbar': {
              width: '6px',
            },
            '&::-webkit-scrollbar-track': {
              width: '8px',
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'gray.300',
              borderRadius: '24px',
            },
          }}
       
          sx={{
    // Hide scrollbar but keep functionality
    '&::-webkit-scrollbar': {
      display: 'none', // Safari and Chrome
    },
     msOverflowStyle: 'none',
  scrollbarWidth: 'none' // Firefox
  }}
        >
          <Outlet />
        </Box>
      </Flex>

      {/* Enhanced Right Sidebar */}
      <Box
        w={{ base: "100%", lg: "320px" }}
        display={{ base: "none", lg: "block" }}
        borderLeft="1px solid"
        borderColor={borderColor}
        overflowY="auto"
        bg={useColorModeValue("gray.50", "gray.900")}
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'gray.300',
            borderRadius: '24px',
          },
        }}
      >
        <RightSidebar />
      </Box>
    </Flex>
  );
}