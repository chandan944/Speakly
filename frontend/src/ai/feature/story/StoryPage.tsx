import { useState, useEffect } from "react";
import {
  Camera,
  Send,
  X,
  Heart,
  Laugh,
  Edit,
  Trash2,
  Plus,
  Clock,
  Loader2,
  MessageSquare,
  Lock,
  Star
} from "lucide-react";
import {
  Box,
  Button,
  Input,
  Text,
  VStack,
  HStack,
  IconButton,
  Avatar,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  useDisclosure,
  useToast,
  Badge,
  Flex,
  Textarea,
  Wrap,
  WrapItem,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner
} from "@chakra-ui/react";
import { useAuthentication, type User } from "../../../features/authentication/context/AuthenticationContextProvider";
import { TimeAgo } from "../../../features/feed/TimeAgo";

// === INTERFACES ===


export interface StoryReaction {
  id: number;
  storyId: number;
  userId: number;
  emoji: string;
  user: User;
  createdAt: string;
}

export interface Story {
  id: number;
  content: string;
  imageUrl?: string;
  user: User;
  createdAt: string;
  reactions: StoryReaction[];
}

// === STORY FORMATTER - ONLY CHANGES HERE ===
const StoryFormatter = ({ content }: { content: string }) => {
  const formatStory = (text: string) => {
    return text
      // 🔶 Yellow highlight for emphasis
      .replace(/\*\*(.*?)\*\*/g, '<span class="highlight-yellow">$1</span>')
      
      // 💬 Italic for thoughts/whispers
      .replace(/,,(.*?),,/g, '<span class="italic-thought">$1</span>')
      
      // 🎭 Quotes with special styling
      .replace(/""(.*?)""/g, '<span class="styled-quote">$1</span>')
      
      // 🧠 Brain header
      .replace(/🧠 (.*?)(?=\n|$)/g, '<div class="header-brain">🧠 $1</div>')
      
      // 🌈 Rainbow tone header
      .replace(/🌈 (.*?)(?=\n|$)/g, '<div class="header-rainbow">🌈 $1</div>')
      
      // 📢 Announcement styling
      .replace(/📢 (.*?)(?=\n|$)/g, '<div class="announcement">$1</div>')
      
      // ❤️ Moral lesson with special box
      .replace(/❤️ (.*?)(?=\n|$)/g, '<div class="moral-lesson">❤️ $1</div>')
      
      // /// Wisdom blocks
      .replace(/\/\/\/(.*?)\/\//g, '<div class="wisdom-block">$1</div>')
      
      // Line breaks
      .replace(/\n/g, '<br/>');
  };

  return (
    <div
      className="formatted-story-content"
      dangerouslySetInnerHTML={{ __html: formatStory(content) }}
    />
  );
};

// === COMPONENT ===
const StoryPage = () => {
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [editingStory, setEditingStory] = useState<Story | null>(null);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();
  const {user} = useAuthentication();
  const { isOpen: isCreateOpen, onOpen: onCreateOpen, onClose: onCreateClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();

  // Get token and user from localStorage (replace with context in real app)
  const token = localStorage.getItem("token");
  
  // Mock user - in real app, get from authentication context
  const currentUser: User = JSON.parse(localStorage.getItem("user") || "{}") || {
    id: 1,
    firstName: "Guest",
    lastName: "",
    email: "guest@example.com"
  };
  
  // Admin email restriction
  const isAdmin = user?.email === "chandanprajapati6307@gmail.com";
  
  const API_BASE = "http://localhost:8080/api/v1/story";

  // Get safe reactions (handles null/undefined)
  const getReactions = (story: Story): StoryReaction[] => {
    return story.reactions && Array.isArray(story.reactions) ? story.reactions : [];
  };

  // Check if current user is story owner
  const isStoryOwner = (story: Story) => {
    return story.user.id === currentUser.id;
  };

  // Show admin restriction message
  const showAdminRestriction = () => {
    toast({
      title: "Permission denied",
      description: "Only admin can perform this action",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
  };

  // Fetch all stories
  const fetchStories = async () => {
    if (!token) {
      console.warn("❌ No auth token found");
      toast({
        title: "Authentication required",
        status: "warning",
        duration: 3000,
      });
      setError("Please log in to view stories");
      setFetching(false);
      return;
    }

    setFetching(true);
    setError(null);
    console.log("🔍 Fetching stories from:", API_BASE);

    try {
      const res = await fetch(API_BASE, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("📡 API Response Status:", res.status);

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("❌ Fetch stories failed:", res.status, errorData);
        
        if (res.status === 401) {
          toast({
            title: "Session expired",
            description: "Please log in again",
            status: "error",
            duration: 5000,
          });
          setError("Session expired. Please log in again.");
        } else {
          setError(`Failed to load stories: ${errorData.message || 'Server error'}`);
          toast({
            title: "Failed to load stories",
            description: errorData.message || "Server returned an error",
            status: "error",
            duration: 3000,
          });
        }
        setFetching(false);
        return;
      }

      const data: Story[] = await res.json();
      console.log("✅ Successfully fetched stories:", data.length);
      
      // Ensure reactions are initialized
      const safeStories = data.map(story => ({
        ...story,
        reactions: getReactions(story)
      }));
      
      setStories(safeStories);
    } catch (err) {
      console.error("💥 Failed to fetch stories:", err);
      const errorMessage = err instanceof Error ? err.message : "Network error";
      setError(`Failed to load stories: ${errorMessage}`);
      toast({
        title: "Network error",
        description: "Check your connection",
        status: "error",
        duration: 3000,
      });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchStories();
  }, []); // Run once

  // Create story
  const createStory = async () => {
    if (!isAdmin) {
      showAdminRestriction();
      return;
    }
    
    if (!content.trim()) {
      toast({ title: "Content required", status: "warning" });
      return;
    }
    if (!token) {
      toast({ title: "Auth token missing", status: "error" });
      return;
    }

    setLoading(true);
    console.log("📤 Creating new story:", { content, hasImage: !!selectedImage });

    const formData = new FormData();
    if (selectedImage) formData.append("picture", selectedImage);
    formData.append("content", content);

    try {
      const res = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Create story failed:", res.status, errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const newStory: Story = await res.json();
      console.log("✅ Story created:", newStory.id);
      
      // Ensure reactions are initialized
      const safeStory = {
        ...newStory,
        reactions: getReactions(newStory)
      };
      
      // Add to stories array (this fixes the "no stories after creation" issue)
      setStories(prev => [safeStory, ...prev]);
      onCreateClose();
      resetForm();
      toast({ title: "Story created!", status: "success" });
    } catch (err) {
      console.error("❌ Create story failed:", err);
      toast({
        title: "Create failed",
        description: err instanceof Error ? err.message : "Check console for details",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update story
  const updateStory = async () => {
    if (!isAdmin) {
      showAdminRestriction();
      return;
    }
    
    if (!editingStory || !editingStory.content.trim()) return;
    if (!token) {
      toast({ title: "Authentication required", status: "error" });
      return;
    }

    setLoading(true);
    console.log("🔄 Updating story:", editingStory.id);

    const formData = new FormData();
    formData.append("content", editingStory.content);
    if (selectedImage) formData.append("picture", selectedImage);

    try {
      const res = await fetch(`${API_BASE}/${editingStory.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Update failed:", res.status, errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const updatedStory: Story = await res.json();
      console.log("✅ Story updated:", updatedStory.id);
      
      // Ensure reactions are initialized
      const safeStory = {
        ...updatedStory,
        reactions: getReactions(updatedStory)
      };
      
      setStories(stories.map(s => s.id === safeStory.id ? safeStory : s));
      setEditingStory(null);
      resetForm();
      toast({ title: "Story updated!", status: "success" });
    } catch (err) {
      console.error("❌ Update failed:", err);
      toast({ 
        title: "Update failed", 
        description: err instanceof Error ? err.message : "Network error",
        status: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Delete story
  const deleteStory = async (storyId: number) => {
    if (!isAdmin) {
      showAdminRestriction();
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this story? This action cannot be undone.")) {
      return;
    }
    
    if (!token) {
      toast({ title: "Authentication required", status: "error" });
      return;
    }

    console.log("🗑️ Attempting to delete story:", storyId);

    try {
      const res = await fetch(`${API_BASE}/${storyId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("❌ Delete failed:", res.status, errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      console.log("✅ Story deleted successfully");
      setStories(stories.filter(s => s.id !== storyId));
      
      toast({ 
        title: "Story deleted", 
        status: "success",
        duration: 2000
      });
    } catch (err) {
      console.error("💥 Delete error details:", err);
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Network error",
        status: "error",
        isClosable: true,
      });
    }
  };

  // React to story
  const reactToStory = async (storyId: number, emoji: string) => {
    if (!token) {
      toast({ title: "Authentication required", status: "error" });
      return;
    }

    console.log("💬 Attempting to react to story:", storyId, "with", emoji);

    try {
      const res = await fetch(`${API_BASE}/${storyId}/react?emoji=${encodeURIComponent(emoji)}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error("❌ Reaction failed:", res.status, errorData);
        throw new Error(`HTTP ${res.status}: ${errorData.message || 'Unknown error'}`);
      }

      console.log("✅ Reaction successful");
      // Refresh to get updated reactions
      await fetchStories();
      toast({ 
        title: "Reaction added!", 
        status: "success",
        duration: 2000
      });
    } catch (err) {
      console.error("💥 Full reaction error:", err);
      toast({
        title: "Reaction failed",
        description: err instanceof Error ? err.message : "Check console for details",
        status: "error",
        isClosable: true,
      });
    }
  };

  // Reset form
  const resetForm = () => {
    setContent("");
    setSelectedImage(null);
    setPreviewUrl(null);
  };

  // Handle image selection
  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedImage]);

  // Get avatar URL
  const getAvatarUrl = (user: User) => {
    if (user.profilePicture) {
      return user.profilePicture.startsWith("http")
        ? user.profilePicture
        : `${import.meta.env.VITE_API_URL}/api/v1/storage/${user.profilePicture}`;
    }
    return "/avatar.svg";
  };

  // Get image URL
  const getImageUrl = (story: Story) => {
    if (story.imageUrl) {
      return story.imageUrl.startsWith("http")
        ? story.imageUrl
        : `${import.meta.env.VITE_API_URL}/api/v1/storage/${story.imageUrl}`;
    }
    return previewUrl;
  };

  // Emoji Button Component
  const EmojiButton = ({
    emoji,
    icon: Icon,
    label,
    onClick,
  }: {
    emoji: string;
    icon: any;
    label: string;
    onClick: () => void;
  }) => (
    <Tooltip label={label}>
      <IconButton
        icon={<Icon size={16} />}
        aria-label={label}
        size="sm"
        variant="ghost"
        colorScheme="purple"
        _hover={{ transform: "scale(1.2)", bg: "purple.100" }}
        onClick={onClick}
        transition="all 0.2s"
      >
        {emoji}
      </IconButton>
    </Tooltip>
  );

  return (
    <Box bg="gray.50" minH="100vh" p={6}>
      {/* Header */}
      <Flex justify="space-between" align="center" mb={6}>
        <HStack>
          <Star size={28} className="text-purple-500 animate-spin-slow" />
          <Text
            fontSize="3xl"
            fontWeight="bold"
            bgGradient="linear(to-r, purple.600, pink.600, blue.600)"
            bgClip="text"
          >
            Stories
          </Text>
        </HStack>
        
        {/* Only show create button for admin */}
        {isAdmin ? (
          <Button leftIcon={<Plus />} colorScheme="purple" onClick={onCreateOpen}>
            New Story
          </Button>
        ) : (
          <HStack>
            <Lock size={16} color="gray" />
            <Text fontSize="sm" color="gray.500">Read-only mode</Text>
          </HStack>
        )}
      </Flex>

      {/* Admin Badge */}
      {isAdmin && (
        <Alert status="info" mb={4} borderRadius="md">
          <AlertIcon />
          <AlertTitle>Admin Mode</AlertTitle>
          <AlertDescription>You can create, edit, and delete stories</AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Box>
          <Flex alignItems="center" gap={2}>
            <Button size="sm" onClick={fetchStories} colorScheme="red">
              Retry
            </Button>
            <IconButton
              aria-label="Close"
              icon={<X size={14} />}
              size="sm"
              onClick={() => setError(null)}
            />
          </Flex>
        </Alert>
      )}

      {/* Loading State */}
      {fetching ? (
        <VStack spacing={4} py={10}>
          <Spinner size="xl" color="purple.500" />
          <Text>Loading stories...</Text>
        </VStack>
      ) : stories.length === 0 ? (
        <Box textAlign="center" py={10}>
          <Camera size={48} className="text-gray-300 mx-auto" />
          <Text fontSize="lg" color="gray.500" mt={2}>
            No stories yet
          </Text>
          {isAdmin && (
            <Button 
              mt={4}
              leftIcon={<Plus />} 
              colorScheme="purple"
              onClick={onCreateOpen}
            >
              Create Your First Story
            </Button>
          )}
        </Box>
      ) : (
        <Wrap spacing={6} justify="center">
          {stories.map((story) => (
            <WrapItem key={story.id}>
              <Box
                bg="white"
                borderRadius="2xl"
                overflow="hidden"
                shadow="xl"
                width="300px"
                position="relative"
                _hover={{ transform: "scale(1.03)", shadow: "2xl" }}
                transition="all 0.3s"
              >
                {/* Story Image */}
                {getImageUrl(story) && (
                  <Box
                    h="200px"
                    bgImage={`url(${getImageUrl(story)})`}
                    bgSize="cover"
                    bgPosition="center"
                    position="relative"
                  >
                    <Flex justify="end" p={3}>
                      {/* Only show edit/delete for admin */}
                      {isAdmin && (
                        <HStack spacing={2}>
                          <Tooltip label="Edit story">
                            <IconButton
                              icon={<Edit size={14} />}
                              size="xs"
                              colorScheme="blue"
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingStory(story);
                                setContent(story.content);
                                setSelectedImage(null);
                                setPreviewUrl(null);
                              }}
                              aria-label="Edit"
                            />
                          </Tooltip>
                          <Tooltip label="Delete story">
                            <IconButton
                              icon={<Trash2 size={14} />}
                              size="xs"
                              colorScheme="red"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteStory(story.id);
                              }}
                              aria-label="Delete"
                            />
                          </Tooltip>
                        </HStack>
                      )}
                    </Flex>
                  </Box>
                )}

                {/* Content */}
                <Box p={4}>
                  <HStack justify="space-between" mb={2}>
                    <HStack>
                      <Avatar
                        size="sm"
                        name={`${story.user.firstName} ${story.user.lastName}`}
                        src={getAvatarUrl(story.user)}
                      />
                      <Text fontWeight="bold" fontSize="sm">
                        {story.user.firstName} {story.user.lastName}
                      </Text>
                    </HStack>
                  </HStack>

                  <Text fontSize="sm" color="gray.700" noOfLines={2} mb={3}>
                    {story.content}
                  </Text>

                  {/* Reactions */}
                  <HStack spacing={1} mb={2}>
                    {getReactions(story).slice(0, 5).map((r, i) => (
                      <Tooltip key={i} label={`${r.user.firstName}: ${r.emoji}`}>
                        <Text 
                          fontSize="lg" 
                          cursor="pointer"
                          _hover={{ transform: "scale(1.2)" }}
                          transition="all 0.2s"
                        >
                          {r.emoji}
                        </Text>
                      </Tooltip>
                    ))}
                    {getReactions(story).length > 5 && (
                      <Text fontSize="sm" color="gray.500">
                        +{getReactions(story).length - 5}
                      </Text>
                    )}
                  </HStack>

                  <Button
                    size="sm"
                    variant="outline"
                    colorScheme="purple"
                    width="full"
                    onClick={() => {
                      setActiveStory(story);
                      onViewOpen();
                    }}
                    leftIcon={<MessageSquare size={14} />}
                  >
                    View Story
                  </Button>
                </Box>
              </Box>
            </WrapItem>
          ))}
        </Wrap>
      )}

      {/* Create Modal */}
      <Modal isOpen={isCreateOpen} onClose={onCreateClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>Create New Story</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={3}
                borderRadius="xl"
                minH="100px"
              />
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                borderRadius="xl"
              />
              {previewUrl && (
                <Box
                  h="200px"
                  bgImage={previewUrl}
                  bgSize="cover"
                  bgPosition="center"
                  borderRadius="xl"
                  width="100%"
                  position="relative"
                >
                  <IconButton
                    icon={<X />}
                    size="sm"
                    colorScheme="red"
                    position="absolute"
                    top={2}
                    right={2}
                    onClick={() => setSelectedImage(null)}
                    aria-label="Remove image"
                  />
                </Box>
              )}
              <Button
                leftIcon={loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                colorScheme="purple"
                width="full"
                isLoading={loading}
                onClick={createStory}
                borderRadius="xl"
                size="lg"
              >
                Post Story
              </Button>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* View Story Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="lg">
        <ModalOverlay />
        <ModalContent borderRadius="2xl">
          <ModalHeader>View Story</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {activeStory && (
              <VStack spacing={4}>
                {getImageUrl(activeStory) && (
                  <Box
                    h="300px"
                    bgImg={getImageUrl(activeStory)}
                    bgSize="cover"
                    bgPosition="center"
                    borderRadius="xl"
                    width="100%"
                  />
                )}
                
                {/* ✅ ONLY CHANGE: Replaced Text with StoryFormatter */}
                <StoryFormatter content={activeStory.content} />
                
                <Text fontSize="sm" color="gray.500">
                  By {activeStory.user.firstName} {activeStory.user.lastName}
                </Text>

                {/* Emoji Reactions */}
                <HStack spacing={3} justify="center" width="100%" mt={4}>
                  <EmojiButton 
                    emoji="❤️" 
                    icon={Heart} 
                    label="Like" 
                    onClick={() => reactToStory(activeStory.id, "❤️")} 
                  />
                  <EmojiButton 
                    emoji="😂" 
                    icon={Laugh} 
                    label="Laugh" 
                    onClick={() => reactToStory(activeStory.id, "😂")} 
                  />
                  <EmojiButton 
                    emoji="😮" 
                    icon={Camera} 
                    label="Surprise" 
                    onClick={() => reactToStory(activeStory.id, "😮")} 
                  />
                  <EmojiButton 
                    emoji="🔥" 
                    icon={Star} 
                    label="Fire" 
                    onClick={() => reactToStory(activeStory.id, "🔥")} 
                  />
                </HStack>
                
                {/* Reaction List */}
                {getReactions(activeStory).length > 0 && (
                  <Box width="100%" mt={4}>
                    <Text fontWeight="bold" mb={2}>Reactions:</Text>
                    <Wrap spacing={2}>
                      {getReactions(activeStory).map((reaction, index) => (
                        <Tooltip 
                          key={index} 
                          label={`${reaction.user.firstName} reacted with ${reaction.emoji}`}
                        >
                          <Badge 
                            variant="outline" 
                            px={2} 
                            py={1} 
                            borderRadius="full"
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            {reaction.emoji}
                            <Text fontSize="xs">{reaction.user.firstName}</Text>
                          </Badge>
                        </Tooltip>
                      ))}
                    </Wrap>
                  </Box>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Edit Story Modal */}
      {editingStory && (
        <Modal isOpen={!!editingStory} onClose={() => setEditingStory(null)} size="lg">
          <ModalOverlay />
          <ModalContent borderRadius="2xl">
            <ModalHeader>Edit Story</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <Textarea
                  value={editingStory.content}
                  onChange={(e) => setEditingStory({ ...editingStory, content: e.target.value })}
                  rows={3}
                  borderRadius="xl"
                  minH="100px"
                />
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setSelectedImage(file);
                      setPreviewUrl(URL.createObjectURL(file));
                    }
                  }}
                  borderRadius="xl"
                />
                {previewUrl && (
                  <Box
                    h="200px"
                    bgImage={previewUrl}
                    bgSize="cover"
                    bgPosition="center"
                    borderRadius="xl"
                    width="100%"
                  />
                )}
                <Button
                  leftIcon={loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                  colorScheme="purple"
                  width="full"
                  isLoading={loading}
                  onClick={updateStory}
                  borderRadius="xl"
                  size="lg"
                >
                  Update Story
                </Button>
              </VStack>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {/* Styles */}
      <style jsx>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        /* Story formatting styles */
        .formatted-story-content {
          line-height: 1.8;
          font-size: 16px;
          color: #1a202c;
          width: 100%;
        }
        
        /* Yellow highlight for key moments */
        .highlight-yellow {
          background: linear-gradient(120deg, rgba(255, 238, 0, 0.3), rgba(255, 238, 0, 0.3));
          padding: 0.1em 0.3em;
          border-radius: 4px;
          font-weight: 600;
        }
        
        /* Thoughts in italic with subtle color */
        .italic-thought {
          font-style: italic;
          color: #64748b;
          font-size: 0.95em;
        }
        
        /* Styled quotes */
        .styled-quote {
          font-style: italic;
          color: #0f172a;
          background: #f8fafc;
          padding: 0.5em 1em;
          border-left: 4px solid #805ad5;
          border-radius: 4px;
          display: inline-block;
          margin: 1em 0;
        }
        
        /* Brain header */
        .header-brain {
          font-weight: 700;
          font-size: 1.2em;
          color: #4c1d95;
          margin: 1.5em 0 0.8em 0;
          padding: 0.8em 1.2em;
          background: linear-gradient(135deg, #f5f3ff, #ede9fe);
          border-radius: 12px;
          border-left: 5px solid #a78bfa;
        }
        
        /* Rainbow header */
        .header-rainbow {
          font-weight: 600;
          font-size: 1.2em;
          background: linear-gradient(90deg, #ef4444, #f97316, #eab308, #22c55e, #3b82f6, #8b5cf6, #ec4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin: 1.5em 0 0.8em 0;
          padding: 0.8em 1.2em;
          border-radius: 12px;
          text-align: center;
        }
        
        /* Announcement */
        .announcement {
          text-align: center;
          font-weight: 700;
          font-size: 1.1em;
          color: #dc2626;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin: 2em 0;
          padding: 0.8em;
          background: #fef2f2;
          border-radius: 12px;
          border: 2px dashed #fecaca;
        }
        
        /* Wisdom block */
        .wisdom-block {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          border: 2px solid #bae6fd;
          border-radius: 12px;
          padding: 1.2em;
          margin: 1.5em 0;
          font-weight: 500;
          color: #0369a1;
        }
        
        /* Moral lesson */
        .moral-lesson {
          text-align: center;
          font-size: 1.1em;
          font-weight: 600;
          color: #7c2d12;
          margin: 2.5em 0 1.5em 0;
          padding: 1.2em;
          background: linear-gradient(135deg, #fff7ed, #ffedd5);
          border-radius: 16px;
          border: 2px solid #fed7aa;
        }
        
        /* Subtle animations for engagement */
        @keyframes pulse-gentle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        
        .highlight-yellow {
          animation: pulse-gentle 3s ease-in-out infinite;
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
          100% { transform: translateY(0px); }
        }
        
        .moral-lesson, .announcement {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </Box>
  );
};

export default StoryPage;