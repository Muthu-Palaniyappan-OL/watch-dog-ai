import { motion } from "framer-motion";
import { FiLinkedin, FiGithub } from "react-icons/fi"; // Importing icons

const teamMemberVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const teamMembers = [
    {
      name: "Balaji Anbalagan",
      role: "Full Stack Developer",
      linkedin: "https://www.linkedin.com/in/balaji-anbalagan-477020179/",
      github: "https://github.com/balajianbalagan/",
      icon: "./bali.jpeg",
    },
    {
      name: "Muthu Palaniyappan OL",
      role: "Backend Developer",
      linkedin: "https://www.linkedin.com/in/muthu-palaniyappan-ol-162422201/",
      github: "https://github.com/Muthu-Palaniyappan-OL",
      icon: "muthu.jpeg"
    },
    {
      name: "Saisathish Karthikeyan",
      role: "UI/UX Specialist",
      linkedin: "https://www.linkedin.com/in/saisathish-karthikeyan/",
      github: "https://github.com/ksaisathish",
      icon: "./sai.jpg",
    },
    {
      name: "Jayenth Saravanakumar",
      role: "AI/ML Developer",
      linkedin: "https://www.linkedin.com/in/jayenth-saravanakumar-400846233/",
      github: "https://github.com/jayenthsk",
      icon: "./jayenth.jpeg",
    },
    {
      name: "Dinesh Anand",
      role: "AI/ML Developer",
      linkedin: "https://www.linkedin.com/in/dineshanandasubramani/",
      github: "https://github.com/Dineshrepostry",
      icon: './dinesh.jpeg',
    },
];

const Team = () => {
  return (
    <div id="Team" className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-sky-400">Meet Our Team</h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            The Visionaries Behind WatchDog AI
          </p>
          <p className="mt-6 text-lg leading-8 text-gray-600">
            Our team brings together the brightest minds in AI, engineering, and security to deliver innovative surveillance solutions.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                className="relative pl-16"
                initial="hidden"
                animate="visible"
                variants={teamMemberVariants}
                custom={index}
                whileHover={{ scale: 1.05 }} // Scale on hover
                whileTap={{ scale: 0.95 }} // Scale down on click
              >
                <dt className="text-base font-semibold leading-7 text-gray-900">
                  <motion.div className="flex h-20 w-20 items-center justify-center rounded-lg">
                    <motion.img
                      src={member.icon}
                      alt={member.name}
                      className="h-20 w-20 rounded-full object-cover"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: index * 0.2 }} // Delays each image
                    />
                  </motion.div>
                  {member.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-gray-600">{member.role}</dd>
                <div className="mt-1 text-sm leading-6 text-gray-500 flex space-x-4">
                  <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:text-sky-700">
                    <FiLinkedin size={24} /> {/* LinkedIn Icon */}
                  </a>
                  <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-gray-800 hover:text-gray-900">
                    <FiGithub size={24} /> {/* GitHub Icon */}
                  </a>
                </div>
              </motion.div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default Team;
