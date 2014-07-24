import os
import setuptools

HERE = os.path.abspath(os.path.dirname(__file__))
README = open(os.path.join(HERE, 'README.md')).read()

requires = [
  'requests==2.3.0',
]

setuptools.setup(name='pijaz-sdk',
  version='0.1',
  description='Pijaz Platform Software Development Kit',
  long_description=README,
  classifiers=[
    "Programming Language :: Python",
    "Intended Audience :: Developers",
    "License :: OSI Approved :: MIT License",
    "Topic :: Artistic Software",
    "Topic :: Multimedia :: Graphics",
    "Topic :: Multimedia :: Graphics :: Editors",
    "Topic :: Software Development :: Libraries :: Application Frameworks",
    "Topic :: Software Development :: Libraries :: Python Modules",
  ],
  author='Chad Phillips',
  author_email='chad@pijaz.com',
  url='',
  keywords='pijaz graphics sdk synthesizer platform',
  packages=setuptools.find_packages(),
  include_package_data=True,
  zip_safe=False,
  install_requires=requires,
)

