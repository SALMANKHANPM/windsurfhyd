interface Feature {
  title: string;
  description: string;
  image: string;
}

interface FeatureProps {
  heading: string;
  description?: string;
  feature1: Feature;
  feature2: Feature;
  feature3: Feature;
  feature4: Feature;
}

const Features = ({
  heading = "Learn to Read, Speak and Write Telugu, English",
  description = "Our Features",
  feature1 = {
    title: "AI-Powered Chat Assistant",
    description:
      "Engage in natural conversations with our intelligent AI assistant that understands both Telugu and English. Get instant responses, translations, and contextual help for your language learning journey.",
    image: "https://shadcnblocks.com/images/block/placeholder-1.svg",
  },
  feature2 = {
    title: "Speech Recognition & Transcription",
    description:
      "Practice speaking Telugu with real-time audio transcription powered by Whisper AI. Get instant feedback on pronunciation and see your spoken words transcribed accurately in both Telugu and English.",
    image: "https://shadcnblocks.com/images/block/placeholder-2.svg",
  },
  feature3 = {
    title: "Interactive Learning Modules",
    description:
      "Master Telugu through engaging exercises including speaking practice, quizzes, text matching, and writing exercises. Learn at your own pace with structured lessons designed for effective language acquisition.",
    image: "https://shadcnblocks.com/images/block/placeholder-1.svg",
  },
  feature4 = {
    title: "Multimodal Learning Experience",
    description:
      "Learn through multiple channels - text, audio, and images. Upload images for context-aware conversations, practice with audio exercises, and receive personalized feedback to accelerate your Telugu learning.",
    image: "https://shadcnblocks.com/images/block/placeholder-2.svg",
  },
}) => {
  return (
    <section className="p-5 flex flex-col items-center bg-whitesmoke">
      <div className="container">
        <div className="mb-24 gap-6">
          <p className="font-medium text-muted-foreground md:max-w-4xl lg:text-xl">
            {description}
          </p>
          <h1 className="text-4xl font-semibold lg:max-w-3xl lg:text-6xl lg:text-nowrap">
            {heading}
          </h1>
        </div>
        <div className="relative flex justify-center">
          <div className="border-muted2 relative flex w-full flex-col border md:w-1/2 lg:w-full">
            <div className="relative flex flex-col lg:flex-row">
              <div className="border-muted2 flex flex-col justify-between border-b border-solid p-10 lg:w-3/5 lg:border-r lg:border-b-0">
                <h2 className="text-xl font-semibold">{feature1.title}</h2>
                <p className="text-muted-foreground">{feature1.description}</p>
                <img
                  src={feature1.image}
                  alt={feature1.title}
                  className="mt-8 aspect-[1.5] h-full w-full object-cover lg:aspect-[2.4]"
                />
              </div>
              <div className="flex flex-col justify-between p-10 lg:w-2/5">
                <h2 className="text-xl font-semibold">{feature2.title}</h2>
                <p className="text-muted-foreground">{feature2.description}</p>
                <img
                  src={feature2.image}
                  alt={feature2.title}
                  className="mt-8 aspect-[1.45] h-full w-full object-cover"
                />
              </div>
            </div>
            <div className="border-muted2 relative flex flex-col border-t border-solid lg:flex-row">
              <div className="border-muted2 flex flex-col justify-between border-b border-solid p-10 lg:w-2/5 lg:border-r lg:border-b-0">
                <h2 className="text-xl font-semibold">{feature3.title}</h2>
                <p className="text-muted-foreground">{feature3.description}</p>
                <img
                  src={feature3.image}
                  alt={feature3.title}
                  className="mt-8 aspect-[1.45] h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col justify-between p-10 lg:w-3/5">
                <h2 className="text-xl font-semibold">{feature4.title}</h2>
                <p className="text-muted-foreground">{feature4.description}</p>
                <img
                  src={feature4.image}
                  alt={feature4.title}
                  className="mt-8 aspect-[1.5] h-full w-full object-cover lg:aspect-[2.4]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { Features };
