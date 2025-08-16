import React, { useState } from 'react';
import {
  ChakraProvider,
  Box,
  Flex,
  Text,
  Button,
  Input,
  VStack,
  HStack,
  Avatar,
  Badge,
  Card,
  CardBody,
  Grid,
  GridItem,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Progress,
  Divider,
  Container,
  SimpleGrid,
  Heading,
  extendTheme
} from '@chakra-ui/react';
import {
  SearchIcon,
  BellIcon,
  ChatIcon,
  StarIcon,
  QuestionIcon,
  CheckIcon,
  InfoIcon
} from '@chakra-ui/icons';

// Custom theme with green primary color
const theme = extendTheme({
  colors: {
    brand: {
      50: '#f0fff4',
      100: '#c6f6d5',
      200: '#9ae6b4',
      300: '#68d391',
      400: '#48bb78',
      500: '#38a169',
      600: '#2f855a',
      700: '#276749',
      800: '#22543d',
      900: '#1a202c',
    }
  }
});

const NotFound = () => {
  const { isOpen: isLoginOpen, onOpen: onLoginOpen, onClose: onLoginClose } = useDisclosure();
  const { isOpen: isSignupOpen, onOpen: onSignupOpen, onClose: onSignupClose } = useDisclosure();
  const [currentView, setCurrentView] = useState('home');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const NavBar = () => (
    <Box bg="white" boxShadow="sm" px={4} py={3}>
      <Flex justify="space-between" align="center" maxW="1200px" mx="auto">
        <HStack spacing={4}>
          <Text fontSize="xl" fontWeight="bold" color="brand.600">
            🗣️ Talkey
          </Text>
          <Input
            placeholder="Search for people..."
            maxW="300px"
            bg="gray.50"
            border="none"
            _focus={{ bg: "white", boxShadow: "sm" }}
          />
        </HStack>
        
        <HStack spacing={6}>
          <Button variant="ghost" onClick={() => setCurrentView('home')}>Home</Button>
          <Button variant="ghost" onClick={() => setCurrentView('sentences')}>Sentences</Button>
          <Button variant="ghost">Messages</Button>
          <Button variant="ghost">Learners</Button>
          <IconButton
            aria-label="Notifications"
            icon={<BellIcon />}
            variant="ghost"
            position="relative"
          >
            <Badge
              colorScheme="red"
              position="absolute"
              top="-1"
              right="-1"
              fontSize="xs"
              borderRadius="full"
            >
              4
            </Badge>
          </IconButton>
          <Button variant="ghost" onClick={() => setCurrentView('quiz')}>Quiz</Button>
          
          {!isLoggedIn ? (
            <HStack spacing={2}>
              <Button colorScheme="brand" variant="outline" onClick={onLoginOpen}>
                Login
              </Button>
              <Button colorScheme="brand" onClick={onSignupOpen}>
                Sign Up
              </Button>
            </HStack>
          ) : (
            <Avatar size="sm" name="User" bg="brand.500" />
          )}
        </HStack>
      </Flex>
    </Box>
  );

  const ProfileCard = () => (
    <Card>
      <CardBody>
        <VStack spacing={4} align="start">
          <HStack>
            <Avatar size="lg" bg="brand.500" />
            <VStack align="start" spacing={1}>
              <Text fontWeight="bold">Lamar Lehner</Text>
              <Text fontSize="sm" color="gray.600">Trinidad and Tobago</Text>
            </VStack>
          </HStack>
          
          <Box>
            <Text fontSize="sm" color="gray.600">Bio</Text>
            <Text>Right-sized bottom-line complexity</Text>
          </Box>
          
          <Box>
            <Text fontSize="sm" color="gray.600">Hobbies</Text>
            <HStack>
              <Text>🎵 Music</Text>
              <Text>🎮 Gaming</Text>
            </HStack>
          </Box>
          
          <Box>
            <Text fontSize="sm" color="gray.600">Points</Text>
            <Text fontWeight="bold">3317</Text>
          </Box>
          
          <HStack>
            <Text fontSize="sm" color="gray.600">Friends</Text>
            <Text>0</Text>
          </HStack>
        </VStack>
      </CardBody>
    </Card>
  );

  const HomeView = () => (
    <Grid templateColumns="300px 1fr 300px" gap={6} maxW="1200px" mx="auto" px={4}>
      <GridItem>
        <ProfileCard />
      </GridItem>
      
      <GridItem>
        <VStack spacing={6}>
          <Card w="full">
            <CardBody>
              <HStack mb={4}>
                <Avatar size="sm" />
                <VStack align="start" spacing={0}>
                  <Text fontWeight="bold">Lamar Lehner</Text>
                  <Text fontSize="sm" color="gray.500">Just now</Text>
                </VStack>
              </HStack>
              
              <Text mb={4}>
                When I first started learning English, I felt so shy 😊. I would hear a word and 
                understand it, but putting it into a full sentence felt so hard. Sometimes, I tried 
                speaking, but my words came out jumbled or my grammar was all over the place 😅. 
                I kept reminding myself — "It's okay to make mistakes. Every mistake is a step 
                forward." 💪📚 Slowly, little by little, I started to feel more confident and enjoy 
                learning.
              </Text>
              
              <HStack>
                <Button leftIcon={<Text>❤️</Text>} variant="ghost" size="sm">
                  2
                </Button>
                <Button leftIcon={<ChatIcon />} variant="ghost" size="sm">
                  Comment
                </Button>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </GridItem>
      
      <GridItem>
        <Card>
          <CardBody>
            <Text fontWeight="bold" mb={4}>Add to Friend</Text>
            <VStack spacing={3}>
              <HStack justify="space-between" w="full">
                <HStack>
                  <Avatar size="sm" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">Denese Zieme</Text>
                    <Text fontSize="xs" color="gray.500">Bahrain</Text>
                  </VStack>
                </HStack>
                <Button size="xs" colorScheme="brand">+👥</Button>
              </HStack>
              
              <HStack justify="space-between" w="full">
                <HStack>
                  <Avatar size="sm" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm">Octavio Kreiger</Text>
                    <Text fontSize="xs" color="gray.500">China</Text>
                  </VStack>
                </HStack>
                <Button size="xs" colorScheme="brand">+👥</Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </GridItem>
    </Grid>
  );

  const QuizView = () => (
    <Container maxW="800px" py={8}>
      <VStack spacing={8}>
        <Box textAlign="center">
          <HStack justify="center" mb={2}>
            <Box bg="brand.500" color="white" p={3} borderRadius="lg">
              <Text>🎮</Text>
            </Box>
            <Text fontSize="xl" fontWeight="bold" color="brand.600">
              English Quiz Adventure
            </Text>
          </HStack>
          <Text color="gray.600" fontStyle="italic">Learn, Play, Level Up!</Text>
        </Box>
        
        <SimpleGrid columns={2} spacing={6} w="full">
          <Card>
            <CardBody textAlign="center">
              <Box mb={4}>
                <Text>❓</Text>
              </Box>
              <Text fontWeight="bold" mb={2}>
                Articles: 'The' is used before unique things or well-known objects.
              </Text>
              <Text fontSize="sm" color="gray.600" mb={4}>10 brain teasers</Text>
              <Button colorScheme="brand" leftIcon={<Text>▶️</Text>}>Play</Button>
            </CardBody>
          </Card>
          
          <Card>
            <CardBody textAlign="center">
              <Box mb={4}>
                <Text>❓</Text>
              </Box>
              <Text fontWeight="bold" mb={2}>
                Present Simple: Used for habits, facts, and routines.
              </Text>
              <Text fontSize="sm" color="gray.600" mb={4}>10 brain teasers</Text>
              <Button colorScheme="brand" leftIcon={<Text>▶️</Text>}>Play</Button>
            </CardBody>
          </Card>
        </SimpleGrid>
      </VStack>
    </Container>
  );

  const SentencesView = () => (
    <Container maxW="800px" py={8}>
      <VStack spacing={6}>
        <Box w="full" bg="brand.50" p={4} borderRadius="lg" borderLeft="4px" borderLeftColor="brand.500">
          <Text fontSize="sm" color="brand.600" mb={2}>YOUR HINDI SENTENCE</Text>
          <Text mb={4}>यार, अच्छे लोग सच में दुनिया को थोड़ा बेहतर बना देते हैं।</Text>
          <Badge colorScheme="gray" size="sm">Level: medium</Badge>
        </Box>
        
        <Card w="full">
          <CardBody>
            <Input
              placeholder="yaar , good people really make world little better"
              size="lg"
              mb={4}
            />
            <Flex justify="flex-end">
              <Button colorScheme="brand" leftIcon={<Text>📤</Text>}>Submit</Button>
            </Flex>
          </CardBody>
        </Card>
        
        <Card w="full">
          <CardBody>
            <HStack mb={4}>
              <StarIcon color="yellow.400" />
              <Text fontWeight="bold">Feedback & Tips</Text>
            </HStack>
            
            <Badge colorScheme="brand" mb={4}>Score: 75%</Badge>
            
            <Box bg="red.50" p={3} borderRadius="md" mb={4}>
              <HStack>
                <Text>🔧</Text>
                <Text fontWeight="bold" color="red.600">Fixes:</Text>
              </HStack>
              <Text fontSize="sm">
                You missed the articles "a" and "the" which are important in English grammar. 
                "Little better" sounds a bit informal; "a little better" is more standard.
              </Text>
            </Box>
            
            <Box bg="blue.50" p={3} borderRadius="md">
              <HStack>
                <Text>💡</Text>
                <Text fontWeight="bold" color="blue.600">Better Version:</Text>
              </HStack>
              <Text fontSize="sm" color="blue.600">
                Hey, good people really do make the world a little better.
              </Text>
            </Box>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );

  const LoginModal = () => (
    <Modal isOpen={isLoginOpen} onClose={onLoginClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Login to Talkey</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input type="email" />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input type="password" />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onLoginClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={() => {
              setIsLoggedIn(true);
              onLoginClose();
            }}
          >
            Login
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  const SignupModal = () => (
    <Modal isOpen={isSignupOpen} onClose={onSignupClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sign Up for Talkey</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>First Name</FormLabel>
              <Input />
            </FormControl>
            <FormControl>
              <FormLabel>Last Name</FormLabel>
              <Input />
            </FormControl>
            <FormControl>
              <FormLabel>Email</FormLabel>
              <Input type="email" />
            </FormControl>
            <FormControl>
              <FormLabel>Password</FormLabel>
              <Input type="password" />
            </FormControl>
            <FormControl>
              <FormLabel>Native Language</FormLabel>
              <Input placeholder="e.g., Hindi, Spanish, French" />
            </FormControl>
          </VStack>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onSignupClose}>
            Cancel
          </Button>
          <Button 
            colorScheme="brand" 
            onClick={() => {
              setIsLoggedIn(true);
              onSignupClose();
            }}
          >
            Sign Up
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );

  const renderCurrentView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />;
      case 'quiz':
        return <QuizView />;
      case 'sentences':
        return <SentencesView />;
      default:
        return <HomeView />;
    }
  };

  return (
    <ChakraProvider theme={theme}>
      <Box minH="100vh" bg="gray.50">
        <NavBar />
        <Box py={6}>
          {renderCurrentView()}
        </Box>
        <LoginModal />
        <SignupModal />
      </Box>
    </ChakraProvider>
  );
};

export default NotFound;